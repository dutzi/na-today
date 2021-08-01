import { Link } from 'react-router-dom';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <Link to="/">
      <h1 className={styles.header}>
        <div className={styles.content}>רק להיום</div>
        <div className={styles.line1} />
        <div className={styles.line2} />
      </h1>
    </Link>
  );
}
