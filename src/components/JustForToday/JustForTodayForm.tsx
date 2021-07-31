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
import Header from '../Header/Header';
import ShareForm from '../ShareForm/ShareForm';

const { encryptString, decryptString } = new StringCrypto();

interface RouteParams {
  date?: string;
  shareId?: string;
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

export default function JustForTodayForm({ readOnly }: { readOnly?: boolean }) {
  const routeParams = useRouteMatch<RouteParams>();
  const [uid, setUid] = useState<string>();
  const [docId, setDocId] = useState<string>();
  const [readOnlyFormDate, setReadOnlyFormDate] = useState<Date>();
  const date = useMemo(
    () => readOnlyFormDate ?? new Date(routeParams.params.date ?? new Date()),
    [routeParams, readOnlyFormDate]
  );
  const [answers, setAnswers] = useState<Answers>();
  const [isShared, setIsShared] = useState<boolean>();
  const [shareId, setShareId] = useState<string | null>(
    routeParams.params.shareId ?? null
  );
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
    if (!userData || readOnly) {
      return;
    }

    setDaysClean(
      Math.round(
        (date.getTime() - userData.firstDayDate.getTime()) /
          (24 * 60 * 60 * 1000)
      )
    );
  }, [date, userData, readOnly]);

  useEffect(() => {
    if (!readOnly || !shareId) {
      return;
    }

    firebase
      .firestore()
      .doc(`/shared-forms/${shareId}`)
      .get()
      .then((doc) => {
        const data = doc.data();
        if (!data) {
          return;
        }

        setAnswers(data.answers as Answers);
        setReadOnlyFormDate(new Date(data.date));
        setDaysClean(data.daysClean);
      });
  }, [shareId, readOnly]);

  // Logs in
  //
  useEffect(() => {
    if (readOnly) {
      return;
    }

    firebase
      .auth()
      .signInAnonymously()
      .then((res) => {
        setUid(res.user?.uid);
      });
  }, [readOnly]);

  // Loads the doc, or creates an empty one
  //
  useEffect(() => {
    if (!uid || readOnly) {
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
          setIsShared(doc.docs[0].data().isShared);
          setShareId(doc.docs[0].data().shareId);
          return;
        }

        firebase
          .firestore()
          .collection(formsCollectionPath)
          .add({
            date: getDate(date),
            answers: encryptAnswers(createEmptyAnswers()),
            isShared: false,
          })
          .then((res) => {
            setDocId(res.id);
            setIsShared(false);
            setAnswers(createEmptyAnswers());
          });
      });
  }, [uid, date, formsCollectionPath, readOnly]);

  // Loads user data
  //
  useEffect(() => {
    if (!uid || readOnly) {
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
  }, [uid, readOnly]);

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

    if (isShared) {
      firebase.firestore().doc(`/shared-forms/${shareId}`).update({ answers });
    }
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
    if (readOnly) {
      return;
    }

    updateAnswer(6, e.target.id);
    setAnswers({ ...answers, q6: e.target.id } as Answers);
  }

  async function handleShare() {
    const shareId = uuidv4().split('-').pop()!;
    await firebase
      .firestore()
      .collection(formsCollectionPath)
      .doc(docId)
      .update({
        isShared: true,
        shareId: shareId,
      });

    await firebase
      .firestore()
      .doc(`/shared-forms/${shareId}`)
      .set({ answers, date: date.toISOString(), daysClean });

    setIsShared(true);
    setShareId(shareId);
  }

  if (!answers) {
    return null;
  }

  return (
    <div className={cx(styles.justForTodayForm, readOnly && styles.readOnly)}>
      <Header />
      {!readOnly && (
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
      )}
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
          readOnly={readOnly}
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
          readOnly={readOnly}
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
          readOnly={readOnly}
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
          readOnly={readOnly}
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
          readOnly={readOnly}
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
          readOnly={readOnly}
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
          readOnly={readOnly}
        />
      </div>
      {!readOnly && (
        <>
          {isShared && <ShareForm shareId={shareId!} />}
          <div className={styles.shareButtons}>
            {!isShared && (
              <>
                <button className={styles.shareButton} onClick={handleShare}>
                  יצירת לינק לשיתוף
                </button>
                <div className={styles.dot}>·</div>
              </>
            )}
            <a
              className={styles.shareWhatsapp}
              href={
                `whatsapp://send?text=` +
                encodeURIComponent(
                  `*רק להיום*\n\n` +
                    [
                      `*איך עבר עלי היום?*\n${answers.q1}`,
                      `*דבר טוב שעבר עלי:*\n${answers.q2}`,
                      `*דבר לא טוב שעבר עלי:*\n${answers.q3}`,
                      `*דבר חדש שלמדתי על עצמי:*\n${answers.q4}`,
                      `*מטרה חדשה שהצבתי לעצמי:*\n${answers.q5}`,
                      `*ציון לעצמי:* ${answers.q6.slice(5)}`,
                      `*הסבר לציון:*\n${answers.q7}`,
                      `*אסירות תודה:*\n${answers.q8}`,
                    ].join('\n\n') +
                    `\n\n` +
                    `(נוצר באמצעות https://na.today)`
                )
              }
            >
              שיתוף בוואטסאפ
            </a>
          </div>
          <div className={styles.disclaimer}>
            השאלון נשמר אוטומטית, בצורה מוצפנת.
            <br />
            לאף אחד, כולל מנהלי האתר אין אפשרות לקרוא את תוכנו, למעט שאלונים
            אותם בחרתם לשתף.
          </div>
        </>
      )}
    </div>
  );
}
