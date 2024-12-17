import { capture } from '@snapshot-labs/snapshot-sentry';
import snapshot from '@snapshot-labs/snapshot.js';
import isEqual from 'lodash/isEqual';
import { addOrUpdateSpace, getSpace } from '../helpers/actions';
import log from '../helpers/log';
import db from '../helpers/mysql';
import { clearStampCache, jsonParse } from '../helpers/utils';
import { getOspSpaceOwner } from '../osp';

const SNAPSHOT_ENV = process.env.NETWORK || 'testnet';
const broviderUrl = process.env.BROVIDER_URL || 'https://rpc.snapshot.org';

export async function validateSpaceSettings(originalSpace: any) {
  const spaceType = originalSpace.turbo ? 'turbo' : 'default';
  const space = snapshot.utils.clone(originalSpace);

  if (space?.deleted) return Promise.reject('space deleted, contact admin');

  delete space.deleted;
  delete space.flagged;
  delete space.verified;
  delete space.turbo;
  delete space.hibernated;
  delete space.id;

  const schemaIsValid: any = snapshot.utils.validateSchema(snapshot.schemas.space, space, {
    spaceType,
    snapshotEnv: SNAPSHOT_ENV
  });

  if (schemaIsValid !== true) {
    log.warn('[writer] Wrong space format', schemaIsValid);
    const firstErrorObject: any = Object.values(schemaIsValid)[0];
    if (firstErrorObject.message === 'network not allowed') {
      return Promise.reject(firstErrorObject.message);
    }
    return Promise.reject('wrong space format');
  }

  if (SNAPSHOT_ENV !== 'testnet') {
    const hasTicket = space.strategies.some(strategy => strategy.name === 'ticket');
    const hasVotingValidation =
      space.voteValidation?.name && !['any'].includes(space.voteValidation.name);

    if (hasTicket && !hasVotingValidation) {
      return Promise.reject('space with ticket requires voting validation');
    }

    const hasProposalValidation =
      (space.validation?.name && space.validation.name !== 'any') ||
      space.filters?.minScore ||
      space.filters?.onlyMembers;

    if (!hasProposalValidation) {
      return Promise.reject('space missing proposal validation');
    }
  }
}

export async function verify(body): Promise<any> {
  const msg = jsonParse(body.msg);
  if (msg.space.length > 64) {
    return Promise.reject('id too long');
  }
  const space = await getSpace(msg.space, true);

  // if (space !== false) {
  //   return Promise.reject('Space Already Exists');
  // }

  try {
    await validateSpaceSettings({
      ...msg.payload,
      deleted: space?.deleted,
      turbo: space?.turbo
    });
  } catch (e) {
    return Promise.reject(e);
  }

  // TODO: validate Osp SpaceId Owner
  const spaceOwner = await getOspSpaceOwner(msg.space);
  const isController = spaceOwner == body.address;
  if (!isController) {
    return Promise.reject('not is space owner');
  }
  const admins = (space?.admins || []).map(admin => admin.toLowerCase());
  const isAdmin = admins.includes(body.address.toLowerCase());
  const newAdmins = (msg.payload.admins || []).map(admin => admin.toLowerCase());

  const anotherSpaceWithDomain = (
    await db.queryAsync('SELECT 1 FROM spaces WHERE domain = ? AND id != ? LIMIT 1', [
      msg.payload.domain,
      msg.space
    ])
  )[0];

  if (msg.payload.domain && anotherSpaceWithDomain) {
    return Promise.reject('domain already taken');
  }

  if (!isAdmin && !isController) return Promise.reject('not allowed');

  if (!isController && !isEqual(admins, newAdmins))
    return Promise.reject('not allowed change admins');

  const labels = msg.payload.labels || [];
  if (labels.length) {
    const uniqueLabelsIds = new Set<string>();
    const uniqueLabelsNames = new Set<string>();
    for (const { id, name } of labels) {
      const labelId = id.toLowerCase();
      const labelName = name.toLowerCase();
      if (uniqueLabelsIds.has(labelId)) {
        return Promise.reject('duplicate label id');
      }
      if (uniqueLabelsNames.has(labelName)) {
        return Promise.reject('duplicate label name');
      }
      uniqueLabelsIds.add(labelId);
      uniqueLabelsNames.add(labelName);
    }
  }
}

export async function action(body): Promise<void> {
  const msg = jsonParse(body.msg);
  const space = msg.space.toLowerCase();
  const existingSettings = JSON.parse(
    (await db.queryAsync('SELECT settings FROM spaces WHERE id = ?', [space])?.[0]) || '{}'
  );

  try {
    await addOrUpdateSpace(space, msg.payload);
  } catch (e) {
    capture(e, { space });
    log.warn('[writer] Failed to store settings', msg.space, JSON.stringify(e));
    return Promise.reject('failed store settings');
  }

  if (existingSettings.avatar !== msg.payload.avatar) await clearStampCache('space', space);
}
