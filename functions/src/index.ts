import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

export const clearSecondLoginLinks = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const docs = await firestore()
      .collection('/second-device-login')
      .where(
        'createdAt',
        '<=',
        new Date(new Date().getTime() - 5 * 60 * 1000).getTime()
      )
      .get();

    functions.logger.info(
      `Deleting second login links, found ${docs.docs.length} docs`
    );

    for (const doc of docs.docs) {
      await doc.ref.delete();
    }

    return null;
  });
