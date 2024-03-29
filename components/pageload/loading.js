import { FiLoader } from "react-icons/fi";
import style from "@styles/pageload.module.css";

export default function LoadingComponent() {
	return (
		<div className={style.area}>
			<FiLoader className={`${style.spinner} loader`} />
		</div>
	);
}
