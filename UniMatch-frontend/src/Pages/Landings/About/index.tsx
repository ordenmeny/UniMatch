import styles from "./Styles/styles.module.scss";

import AlgorithmExample from "./Assets/algorithmExample.png";
import Photo from "./Assets/Photo.png";
import Exeutica from "./Assets/Exeutica.svg";
import Unit from "./Assets/unit.svg";
import Y from "./Assets/y.svg";
import { MyA } from "@/Base/UI/MyA";

export const About = () => {
    return (
        <div className={styles.Landing}>
            <section className={styles.FirstBlock}>
                <h1>Сервис для знакомств среди студентов Екатеринбурга</h1>
            </section>
            <section className={styles.Algorithm}>
                <p>
                    Каждую неделю наши алгоритмы составляют новые пары для
                    общения и нетворкинга.
                    <br />
                    <br />
                    При составлении мы учитываем ваши интересы (для этого
                    используем тэги), но и про рандом не забываем))
                </p>
                <img src={AlgorithmExample} />
            </section>
            <section className={styles.Team}>
                <h3>Команда проекта</h3>
                <div className={styles.TeamList}>
                    <div className={styles.TeamItem}>
                        <img src={Photo} />
                        <div>
                            <span>
                                Дима
                                <br />
                                Александров
                            </span>
                            <p>Backend разработка</p>
                        </div>
                    </div>
                    <div className={styles.TeamItem}>
                        <img src={Photo} />
                        <div>
                            <span>
                                Саша
                                <br />
                                Плюснин
                            </span>
                            <p>Frontend разработка</p>
                        </div>
                    </div>
                    <div className={styles.TeamItem}>
                        <img src={Photo} />
                        <div>
                            <span>
                                Ваня
                                <br />
                                Коваленко
                            </span>
                            <p>Дизайн & маркетинг</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.MadeIn}>
                <MyA href="https://unit-ekb.ru/" className={styles.Block + ' ' + styles.Unit}>
                    <img src={Unit} />
                </MyA>
                <div className={styles.Block + ' ' + styles.Exeutica}>
                    <img src={Exeutica} />
                </div>
                <div className={styles.Block + ' ' + styles.Y}>
                    <img src={Y} />
                </div>
            </section>
        </div>
    );
};
