import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/dist/server/api-utils";
import FinePurchaseButton from "@components/fine-purchase-button";
import style from "@styles/checkout.module.css";
import { IoShieldCheckmark } from "react-icons/io5";

export default async function FinePage() {
	const supabase = createServerComponentClient({ cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.user?.id) {
		redirect("/prihlasit");
	}

	const fineData = await supabase
		.from("fine")
		.select("*")
		.eq("profile_id", session.user.id)
		.single();

	if (fineData?.data == null) {
		redirect("/profil");
	}

	return (
		<>
			<main className={style.area}>
				<IoShieldCheckmark className={style.success} />
				<h1>Máš pokutu!</h1>
				<p>
					Důvod: {fineData.data.description}
					<br /> Pro znovuzpřístupnutí zaplaťte pokutu
				</p>
				<FinePurchaseButton price={fineData.data.stripe_price} />
			</main>
		</>
	);
}
