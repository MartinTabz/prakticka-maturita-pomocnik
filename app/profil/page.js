import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navigation from "@components/navigation";
import { CiImageOff } from "react-icons/ci";
import Image from "next/image";
import style from "@styles/profile.module.css";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect("/prihlasit");
	}

	const { data: orders } = await supabase
		.from("order")
		.select(`*, product_id("*")`)
		.eq("profile_id", session.user.id);

	return (
		<>
			<Navigation isLightTheme={true} />
			<main className={style.section}>
				<div className={style.inner}>
					<div className={style.detail_container}>
						<h2>Údaje</h2>
						<div className={style.detail_grid}>
							<div className={style.detail_inputarea}>
								<label>Uživatelské jméno</label>
								<input
									disabled
									type="text"
									value={session.user.user_metadata.user_name}
								/>
							</div>
							<div className={style.detail_inputarea}>
								<label>Email</label>
								<input disabled type="email" value={session.user.email} />
							</div>
							<div className={style.detail_inputarea}>
								<label>Celé jméno</label>
								<input
									disabled
									type="email"
									value={session.user.user_metadata.full_name}
								/>
							</div>
						</div>
					</div>
					<div className={style.product_container}>
						<h2>Zakoupené produkty</h2>
						<div className={style.product_area}>
							{orders.length > 0 ? (
								<table className={style.product_table}>
									<tbody>
										<tr>
											<th></th>
											<th>Název</th>
											<th>Zakoupeno</th>
											<th>Aktivní</th>
										</tr>
										{orders.map((order, index) => (
											<tr key={index}>
												<td>
													{order.product_id.image ? (
														<Image
															src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/subjects/${order.product_id.image}`}
															alt="Ilustrační obrázek k produktu"
															width={90}
															height={90}
														/>
													) : (
														<CiImageOff />
													)}
												</td>
												<td>{order.product_id.name}</td>
												<td>{formatDateTime(order.created_at)}</td>
												<td>{order.active ? "Ano" : "Ne"}</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<span className={style.noproducts}>
									Zatím nemáte koupený žádný produkt
								</span>
							)}
						</div>
					</div>
				</div>
			</main>
		</>
	);
}

function formatDateTime(dateTimeString) {
	const dateTime = new Date(dateTimeString);

	const pragueDateTime = new Date(
		dateTime.toLocaleString("en-US", { timeZone: "Europe/Prague" })
	);

	const day = pragueDateTime.getDate();
	const month = pragueDateTime.getMonth() + 1; // Months are 0-indexed, so add 1
	const year = pragueDateTime.getFullYear();

	const hours = pragueDateTime.getHours();
	const minutes = pragueDateTime.getMinutes();

	const formattedDateTime = `${day}.${month}.${year} ${hours
		.toString()
		.padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

	return formattedDateTime;
}
