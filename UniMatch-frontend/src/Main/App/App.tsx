import { BrowserRouter } from "react-router";
import { MyRouter } from "./MyRouter";

import { Tracker } from "@/Modules/YandexMetrika/Tracker";
import "./styles/colors.scss";
import "./styles/fonts.scss";
import "./styles/global.scss";
import "./styles/library/buttons.scss";
import "./styles/library/text.scss";
import "./styles/normalize.scss";

function App() {
    return (
        <BrowserRouter>
            <Tracker />
            <MyRouter />
        </BrowserRouter>
    );
}

export default App;
