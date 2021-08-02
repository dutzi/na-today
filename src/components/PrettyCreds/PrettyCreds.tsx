import { useEffect, useState } from 'react';
import styles from './PrettyCreds.module.scss';

export default function PrettyCreds() {
  const [prettyUuid, setPrettyUuid] = useState('');
  const [prettyPassword, setPrettyPassword] = useState('');

  useEffect(() => {
    import('niceware').then((niceware) => {
      setPrettyUuid(
        niceware
          .bytesToPassphrase(Buffer.from(localStorage.getItem('uuid')!))
          .join('\n')
      );
      setPrettyPassword(
        niceware
          .bytesToPassphrase(Buffer.from(localStorage.getItem('password')!))
          .join('\n')
      );
    });
  }, []);

  return (
    <div className={styles.prettyCreds}>
      {prettyPassword ? (
        <>
          <div>שמרו את פרטי ההזדהות שלכם במקום סודי:</div>
          <div className={styles.creds}>
            <pre className={styles.pre}>{prettyUuid}</pre>
            <pre className={styles.pre}>{prettyPassword}</pre>
          </div>
        </>
      ) : (
        <span>מייצר פרטי הזדהות...</span>
      )}
    </div>
  );
}
