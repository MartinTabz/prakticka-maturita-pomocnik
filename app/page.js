import Link from "next/link";
import { FaCircleCheck } from "react-icons/fa6";
import style from "@styles/index.module.css";
import Navigation from "@components/navigation";

export default function IndexPage() {
	return (
		<>
			<Navigation isLightTheme={true} />
			<main>
				<section>
					<div>
						<div>
							<h1>Praktická maturitka s jistotkou</h1>
							<p>
								Detailní pomůcka, která bude vaším nejlepším přítelem při
								skládání praktické maturity
							</p>
							<div>
								<Link href={"/prihlasit"}>Koupit</Link>
								<a href="#info">Zjistit více</a>
							</div>
						</div>
						<div>Video</div>
					</div>
				</section>
				<section id="info">
					<div>
						<div>
							<div></div>
							<div></div>
							<div></div>
						</div>
						<div>
							<h2>Lorem</h2>
							<p>Lorem ipsum</p>
							<div>
								<span>
									<FaCircleCheck />
									Programování a vývoj aplikací
								</span>
								<span>
									<FaCircleCheck />
									Operační systémy
								</span>
								<span>
									<FaCircleCheck />
									Aplikační software
								</span>
							</div>
						</div>
					</div>
				</section>
				<section>
					<div>
						<div>
							<h2>Programování a vývoj aplikací</h2>
							<p>Lorem ipsum</p>
						</div>
						<div>Image</div>
					</div>
				</section>
				<section>
					<div>
						<div>
							<h2>Operační systémy</h2>
							<p>Lorem ipsum</p>
						</div>
						<div>Image</div>
					</div>
				</section>
				<section>
					<div>
						<div>
							<h2>Aplikační software</h2>
							<p>Lorem ipsum</p>
						</div>
						<div>Image</div>
					</div>
				</section>
				<section>
					<h2>Složte praktickou maturitu bez obav</h2>
					<Link href={"/prihlasit"}>Koupit nyní</Link>
				</section>
			</main>
			<footer>
				<Link href={"/vseobecne-obchodni-podminky"}>
					Všeobecné obchodní podmínky
				</Link>
				<Link href={"/podminky-ochrany-osobnich-udaju"}>
					Podmínky ochrany osobních údajů
				</Link>
			</footer>
		</>
	);
}
