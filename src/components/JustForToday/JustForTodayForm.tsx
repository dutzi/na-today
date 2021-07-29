import TextareaAutosize from 'react-textarea-autosize';
import cx from 'classnames';
import firebase from 'firebase';
import { ReactComponent as ChevronRight } from '../../svgs/chevron-right.svg';
import { ReactComponent as ChevronLeft } from '../../svgs/chevron-left.svg';
import styles from './JustForTodayForm.module.scss';
import { Link, useRouteMatch } from 'react-router-dom';
import React, { useEffect, useMemo, useState } from 'react';
import throttle from 'lodash/fp/throttle';
import StringCrypto from 'string-crypto';
import { v4 as uuidv4 } from 'uuid';

const { encryptString, decryptString } = new StringCrypto();

interface RouteParams {
  date?: string;
}

const dayInMs = 24 * 60 * 60 * 1000;

function prettyPrintDate(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function getDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createEmptyAnswers() {
  return {
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
    q8: '',
  };
}

interface Answers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
}

interface UserData {
  firstDayDate: Date;
}

const password = localStorage.getItem('password') ?? uuidv4();

localStorage.setItem('password', password);

export default function JustForTodayForm() {
  const routeParams = useRouteMatch<RouteParams>();
  const [uid, setUid] = useState<string>();
  const [docId, setDocId] = useState<string>();
  const date = useMemo(
    () => new Date(routeParams.params.date ?? new Date()),
    [routeParams]
  );
  const [answers, setAnswers] = useState<Answers>();
  const [userData, setUserData] = useState<UserData>();
  const [daysClean, setDaysClean] = useState(0);

  const prevDate = new Date(date.getTime() - dayInMs);
  const nextDate = new Date(date.getTime() + dayInMs);
  const showNextButton = nextDate.getTime() <= new Date().getTime() + dayInMs;
  const formsCollectionPath = `/just-for-today/${uid}/forms`;

  function encryptAnswers(answers: Answers) {
    return encryptString(JSON.stringify(answers), password);
  }

  function decryptAnswers(answers: string) {
    return JSON.parse(decryptString(answers, password));
  }

  useEffect(() => {
    if (!userData) {
      return;
    }

    setDaysClean(
      Math.round(
        (date.getTime() - userData.firstDayDate.getTime()) /
          (24 * 60 * 60 * 1000)
      )
    );
  }, [date, userData]);

  // Logs in
  //
  useEffect(() => {
    firebase
      .auth()
      .signInAnonymously()
      .then((res) => {
        setUid(res.user?.uid);
      });
  }, []);

  // Loads the doc, or creates an empty one
  //
  useEffect(() => {
    if (!uid) {
      return;
    }

    firebase
      .firestore()
      .collection(formsCollectionPath)
      .where('date', '==', getDate(date))
      .get()
      .then((doc) => {
        if (doc.docs.length !== 0) {
          setDocId(doc.docs[0].id);
          setAnswers(decryptAnswers(doc.docs[0].data().answers) as Answers);
          return;
        }

        firebase
          .firestore()
          .collection(formsCollectionPath)
          .add({
            date: getDate(date),
            answers: encryptAnswers(createEmptyAnswers()),
          })
          .then((res) => {
            setDocId(res.id);
            setAnswers(createEmptyAnswers());
          });
      });
  }, [uid, date, formsCollectionPath]);

  // Update q6 answer (score, radio buttons)
  useEffect(() => {
    if (!answers?.q6) {
      return;
    }
  }, [answers]);

  // Loads user data
  //
  useEffect(() => {
    if (!uid) {
      return;
    }

    firebase
      .firestore()
      .doc(`/just-for-today/${uid}`)
      .get()
      .then((res) => {
        const data = res.data();

        if (!data) {
          return;
        }

        const userData = {
          ...data,
          firstDayDate: new Date(data.firstDayDate),
        } as UserData;

        setUserData(userData);
      });
  }, [uid]);

  const updateAnswer = throttle(500, (index: number, value: string) => {
    firebase
      .firestore()
      .collection(formsCollectionPath)
      .doc(docId)
      .update({
        answers: encryptAnswers({
          ...answers,
          [`q${index}`]: value,
        } as Answers),
      });
  });

  function handleAnswerChange(
    index: number,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    updateAnswer(index, e.target.value);
    setAnswers({ ...answers, [`q${index}`]: e.target.value! } as Answers);
  }

  function handleDaysCleanChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);

    setDaysClean(value);

    const firstDayDate = new Date(date.getTime() - value * 24 * 60 * 60 * 1000);

    firebase.firestore().doc(`/just-for-today/${uid}`).set({
      firstDayDate: firstDayDate.toISOString(),
    });

    setUserData({ firstDayDate });
  }

  function handleScoreChange(e: React.ChangeEvent<HTMLDivElement>) {
    updateAnswer(6, e.target.id);
    setAnswers({ ...answers, q6: e.target.id } as Answers);
  }

  if (!answers) {
    return null;
  }

  return (
    <div className={styles.justForTodayForm}>
      <h1 className={styles.header}>
        <div className={styles.content}>רק להיום</div>
        <div className={styles.line1} />
        <div className={styles.line2} />
      </h1>
      <nav className={styles.nav}>
        <Link
          className={cx(styles.link, styles.backward)}
          to={`/${getDate(prevDate)}`}
        >
          <ChevronRight />
        </Link>
        <div className={styles.spacer} />
        {showNextButton && (
          <Link
            className={cx(styles.link, styles.forward)}
            to={`/${getDate(nextDate)}`}
          >
            <ChevronLeft />
          </Link>
        )}
      </nav>
      <div className={styles.daysClean}>
        <div className={styles.date}>{prettyPrintDate(date)}</div>
        <input
          className={styles.counter}
          value={daysClean}
          onChange={handleDaysCleanChange}
        />
        <label className={styles.label}>ימי נקיון</label>
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q1">
          איך עבר עלי היום?
        </label>
        <TextareaAutosize
          className={styles.textarea}
          id="q1"
          minRows={5}
          value={answers.q1}
          onChange={handleAnswerChange.bind(null, 1)}
        />
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q2">
          דבר טוב שעבר עלי:
        </label>
        <TextareaAutosize
          className={styles.textarea}
          id="q2"
          minRows={5}
          value={answers.q2}
          onChange={handleAnswerChange.bind(null, 2)}
        />
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q3">
          דבר לא טוב שעבר עלי:
        </label>
        <TextareaAutosize
          className={styles.textarea}
          id="q3"
          minRows={5}
          value={answers.q3}
          onChange={handleAnswerChange.bind(null, 3)}
        />
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q4">
          דבר חדש שלמדתי על עצמי:
        </label>
        <TextareaAutosize
          className={styles.textarea}
          id="q4"
          minRows={5}
          value={answers.q4}
          onChange={handleAnswerChange.bind(null, 4)}
        />
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q5">
          מטרה חדשה שהצבתי לעצמי:
        </label>
        <TextareaAutosize
          className={styles.textarea}
          id="q5"
          minRows={5}
          value={answers.q5}
          onChange={handleAnswerChange.bind(null, 5)}
        />
      </div>
      <div className={styles.formControl} onChange={handleScoreChange}>
        <label className={styles.questionLabel} htmlFor="q6">
          ציון לעצמי:
        </label>
        <div className={styles.options}>
          {[...new Array(10)].map((_, index) => (
            <>
              <input
                id={`score${index + 1}`}
                className={styles.option}
                type="radio"
                name="score"
                checked={answers.q6 === `score${index + 1}`}
              />
              <label
                className={styles.optionLabel}
                htmlFor={`score${index + 1}`}
              >
                {index + 1}
              </label>
            </>
          ))}
        </div>
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q7">
          הסבר לציון:
        </label>
        <TextareaAutosize
          className={styles.textarea}
          id="q7"
          minRows={5}
          value={answers.q7}
          onChange={handleAnswerChange.bind(null, 7)}
        />
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q8">
          אסירות תודה:
        </label>
        <TextareaAutosize
          className={styles.textarea}
          id="q8"
          minRows={5}
          value={answers.q8}
          onChange={handleAnswerChange.bind(null, 8)}
        />
      </div>
      <div className={styles.disclaimer}>
        השאלון נשמר אוטומטית, בצורה מוצפנת.
        <br />
        לאף אחד, כולל מנהלי האתר אין אפשרות לקרוא את תוכנו, למעט שאלונים אותם
        בחרתם לשתף.
      </div>
    </div>
  );
}
