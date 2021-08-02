import React, { useEffect, useRef, useState } from 'react';
import firebase from 'firebase/app';
import styles from './PairLandingPage.module.scss';
import StringCrypto from 'string-crypto';
import Header from '../Header/Header';
import { useRouteMatch } from 'react-router-dom';

const { decryptString } = new StringCrypto();

interface RouteParams {
  pairId: string;
}

export default function PairLandingPage() {
  const codeInputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('');
  const [encryptedPassword, setEncryptedPassword] = useState<string>();
  const [encryptedUuid, setEncryptedUuid] = useState<string>();
  const routeMatch = useRouteMatch<RouteParams>();
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCode(e.target.value);
    setShowErrorMessage(false);
  }

  useEffect(() => {
    codeInputRef.current?.focus();
  }, []);

  useEffect(() => {
    firebase
      .firestore()
      .doc(`/pairing/${routeMatch.params.pairId}`)
      .get()
      .then((doc) => {
        setEncryptedPassword(doc.data()?.password);
        setEncryptedUuid(doc.data()?.uuid);
      });
  }, [routeMatch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const uuid = decryptString(encryptedUuid, code);
    const password = decryptString(encryptedPassword, code);

    if (!uuid.match(/\w+-\w+-\w+-\w+-\w+/)) {
      setShowErrorMessage(true);
      return;
    }

    localStorage.setItem('uuid', uuid);
    localStorage.setItem('password', password);
    window.location.href = '/';
  }

  return (
    <div className={styles.pairLandingPage}>
      <Header />
      <div>הזינו את הקוד שקבלתם:</div>
      <form onSubmit={handleSubmit}>
        <input
          ref={codeInputRef}
          className={styles.codeInput}
          type="text"
          value={code}
          onChange={handleCodeChange}
        />
        {showErrorMessage && (
          <div className={styles.error}>הסיסמא איננה נכונה</div>
        )}
        <button className={styles.linkButton} type="submit">
          כניסה
        </button>
      </form>
    </div>
  );
}
