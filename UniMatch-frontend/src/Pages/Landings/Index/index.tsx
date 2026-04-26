import styles from "./Styles/styles.module.scss";
import { Link } from "react-router";

import Unimatch from "./Assets/unimatch.png";
import Algorithm from "./Assets/algorithmExample.png";
import CoolGuys from "./Assets/coolGuys.png";
import { ROUTES } from "@/Main/App/MyRouter";

export const Index = () => {
    return (
        <div className={styles.Landing}>
            <section className={styles.FirstBlock}>
                <h1>
                    Новые знакомства для общения и работы.
                    <br />
                    Рандомно.
                </h1>
                <Link className={styles.Link} to={ROUTES.LOGIN}>
                    Начать
                </Link>
            </section>
            <section className={styles.TextBlock + " " + styles.WeMadeService}>
                <p>
                    Мы создали сервис для знакомств среди студентов
                    Екатеринбурга.
                    <br />
                    <br />
                    От нас алгоритм, который каждую неделю составит рандомные
                    пары (но и про ваши интересы не забудет).
                    <br />А от вас общение и нетворкинг ;)
                </p>
                <img src={Unimatch} />
            </section>
            <h2>Как это устроено?</h2>
            <section className={styles.TextBlock + " " + styles.HowItWorks}>
                <img src={Algorithm} />
                <p>
                    Все очень просто!
                    <br />
                    <br />
                    Вы регистрируетесь, заполняете данные о себе и выбираете
                    интересы с помощью тэгов.
                    <br />
                    <br />И раз в неделю алгоритм будет выбирать вам пару для
                    общения. <i>(Все необходимое придет в телеграм.) </i>
                    <br />
                    Вам остается только хорошо провести время)
                </p>
            </section>
            <h2>А зачем?</h2>
            <section className={styles.TextBlock + " " + styles.ForWhat}>
                <p>
                    Общение — базовая потребность человека. И мы придумали новую
                    форму для него)
                    <br />
                    <br />
                    А ещё это отличный способ найти неожиданные знакомства
                    которые изменят вашу жизнь
                    <br />
                    (или просто сделают её интересней)
                </p>
                <img src={CoolGuys} />
            </section>
        </div>
    );
};
