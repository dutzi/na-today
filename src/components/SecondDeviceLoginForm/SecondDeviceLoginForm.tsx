import React, { useEffect, useState } from 'react';
import firebase from 'firebase';
import styles from './SecondDeviceLoginForm.module.scss';
import StringCrypto from 'string-crypto';
import generator from 'generate-password';

const { encryptString } = new StringCrypto();

var password = generator.generate({
  length: 10,
  numbers: true,
  symbols: true,
  excludeSimilarCharacters: true,
});

async function generateLoginId() {
  let loginId: number;
  while (true) {
    loginId = Math.floor(Math.random() * 1000000);
    const docPath = `/second-device-login/${loginId}`;
    const doc = await firebase.firestore().doc(docPath).get();

    if (!doc.exists) {
      await firebase
        .firestore()
        .doc(docPath)
        .set({
          createdAt: new Date().toISOString(),
          password: encryptString(localStorage.getItem('password'), password),
          uuid: encryptString(localStorage.getItem('uuid'), password),
        });
      break;
    }
  }
  return loginId;
}

export default function SecondDeviceLoginForm() {
  const [loginId, setLoginId] = useState<number>();

  useEffect(() => {
    generateLoginId().then(setLoginId);
  }, []);

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.setSelectionRange(0, e.target.value.length);
  }

  const basepath =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://na.today';

  if (!loginId) {
    return (
      <div className={styles.secondDeviceLoginForm}>מייצר לינק התחברות</div>
    );
  }

  return (
    <div className={styles.secondDeviceLoginForm}>
      <div>כנסו ללינק הבא מתוך המכשיר ממנו תרצו להתחבר:</div>
      <input
        className={styles.url}
        type="text"
        value={`${basepath}/login/${loginId}`}
        onFocus={handleFocus}
      />
      <div>אחרי שנכנסתם ללינק, הזינו את הקוד הבא לכשתתבקשו:</div>
      <div className={styles.code}>{password}</div>
    </div>
  );
}
