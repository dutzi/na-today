import React, { useEffect, useRef, useState } from 'react';
import firebase from 'firebase';
import styles from './Login.module.scss';
import StringCrypto from 'string-crypto';
import Header from '../Header/Header';
import { useRouteMatch } from 'react-router-dom';

const { decryptString } = new StringCrypto();

interface RouteParams {
  loginId: string;
}

export default function Login() {
  const codeInputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState<string>();
  const [encryptedPassword, setEncryptedPassword] = useState<string>();
  const [encryptedUuid, setEncryptedUuid] = useState<string>();
  const routeMatch = useRouteMatch<RouteParams>();
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCode(e.target.value);
  }

  useEffect(() => {
    codeInputRef.current?.focus();
  }, []);

  useEffect(() => {
    firebase
      .firestore()
      .doc(`/second-device-login/${routeMatch.params.loginId}`)
      .get()
      .then((doc) => {
        setEncryptedPassword(doc.data()?.password);
        setEncryptedUuid(doc.data()?.uuid);
      });
  }, [routeMatch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setShowErrorMessage(false);

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
    <div className={styles.login}>
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
