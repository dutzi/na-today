import React, { useState } from 'react';
import Header from '../Header/Header';
import styles from './PrettyCredsSignIn.module.scss';

export default function PrettyCredsSignIn() {
  const [words, setWords] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    import('niceware').then((niceware) => {
      const uuidWords = words.trim().split('\n').slice(0, 6);
      const passwordWords = words.trim().split('\n').slice(6, 12);
      const uuid = niceware.passphraseToBytes(uuidWords).toString();
      const password = niceware.passphraseToBytes(passwordWords).toString();
      localStorage.setItem('uuid', uuid);
      localStorage.setItem('password', password);
      window.location.href = '/';
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setWords(e.target.value);
  }

  return (
    <div className={styles.prettyCredsSignIn}>
      <Header />
      <form className={styles.form} onSubmit={handleSubmit}>
        <div>הזינו את פרטי ההזדהות שלכם:</div>
        <textarea
          className={styles.textarea}
          rows={12}
          onChange={handleChange}
        />
        <button className={styles.linkButton} type="submit">
          כניסה
        </button>
      </form>
    </div>
  );
}
