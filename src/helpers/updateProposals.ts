import snapshot from '@snapshot-labs/snapshot.js';
import db from '../helpers/mysql';
import { updateProposalAndVotes } from '../scores';
import { log } from 'console';

export default async function run() {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const proposals = await db.queryAsync(
      'SELECT id FROM proposals WHERE end < ? AND scores_state = ? ORDER BY end LIMIT 1000',
      [timestamp, 'pending']
    );
    for (const proposal of proposals) {
      await updateProposalAndVotes(proposal.id);
    }
  } catch (error) {}

  await snapshot.utils.sleep(5e3);
  run();
}
