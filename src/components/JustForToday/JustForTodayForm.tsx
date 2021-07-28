import TextareaAutosize from 'react-textarea-autosize';
import styles from './JustForTodayForm.module.scss';

export default function JustForTodayForm() {
  return (
    <div className={styles.justForTodayForm}>
      <h1 className={styles.header}>
        <div className={styles.content}>רק להיום</div>
        <div className={styles.line1} />
        <div className={styles.line2} />
      </h1>
      <div className={styles.daysClean}>
        <input className={styles.counter} value={24} />
        <label className={styles.label}>ימי נקיון</label>
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q1">
          איך עבר עלי היום?
        </label>
        <TextareaAutosize className={styles.textarea} id="q1" minRows={5} />
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q2">
          דבר טוב שעבר עלי?
        </label>
        <TextareaAutosize className={styles.textarea} id="q2" minRows={5} />
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q3">
          דבר לא טוב שעבר עלי?
        </label>
        <TextareaAutosize className={styles.textarea} id="q3" minRows={5} />
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q4">
          דבר חדש שלמדתי על עצמי:
        </label>
        <TextareaAutosize className={styles.textarea} id="q4" minRows={5} />
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q4">
          מטרה חדשה שהצבתי לעצמי למחר:
        </label>
        <TextareaAutosize className={styles.textarea} id="q4" minRows={5} />
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q5">
          ציון לעצמי:
        </label>
        <div className={styles.options}>
          <input
            id="score1"
            className={styles.option}
            type="radio"
            name="score"
          />
          <label className={styles.optionLabel} htmlFor={'score1'}>
            1
          </label>

          <input
            id="score2"
            className={styles.option}
            type="radio"
            name="score"
          />
          <label className={styles.optionLabel} htmlFor={'score2'}>
            2
          </label>

          <input
            id="score3"
            className={styles.option}
            type="radio"
            name="score"
          />
          <label className={styles.optionLabel} htmlFor={'score3'}>
            3
          </label>

          <input
            id="score4"
            className={styles.option}
            type="radio"
            name="score"
          />
          <label className={styles.optionLabel} htmlFor={'score4'}>
            4
          </label>

          <input
            id="score5"
            className={styles.option}
            type="radio"
            name="score"
          />
          <label className={styles.optionLabel} htmlFor={'score5'}>
            5
          </label>
        </div>
        <div className={styles.options}>
          <input
            id="score6"
            className={styles.option}
            type="radio"
            name="score"
          />
          <label className={styles.optionLabel} htmlFor={'score6'}>
            6
          </label>

          <input
            id="score7"
            className={styles.option}
            type="radio"
            name="score"
          />
          <label className={styles.optionLabel} htmlFor={'score7'}>
            7
          </label>

          <input
            id="score8"
            className={styles.option}
            type="radio"
            name="score"
          />
          <label className={styles.optionLabel} htmlFor={'score8'}>
            8
          </label>

          <input
            id="score9"
            className={styles.option}
            type="radio"
            name="score"
          />
          <label className={styles.optionLabel} htmlFor={'score9'}>
            9
          </label>

          <input
            id="score10"
            className={styles.option}
            type="radio"
            name="score"
          />
          <label className={styles.optionLabel} htmlFor={'score10'}>
            10
          </label>
        </div>
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q5">
          הסבר לציון:
        </label>
        <TextareaAutosize className={styles.textarea} id="q5" minRows={5} />
      </div>
      <div className={styles.formControl}>
        <label className={styles.questionLabel} htmlFor="q5">
          אסירות תודה:
        </label>
        <TextareaAutosize className={styles.textarea} id="q5" minRows={5} />
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
