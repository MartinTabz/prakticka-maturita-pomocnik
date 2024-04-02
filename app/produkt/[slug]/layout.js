import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function ProduktLayout({ children, params: { slug } }) {
	if (!slug) {
		notFound();
	}
	const supabase = createServerComponentClient({ cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();
	if (!session) {
		redirect("/prihlaseni");
	}
	const { data: product } = await supabase
		.from("product")
		.select("*")
		.eq("slug", slug)
		.single();

	if (!product?.id) {
		notFound();
	}

	const orderData = await supabase
		.from("order")
		.select("active")
		.eq("product_id", product.id)
		.eq("profile_id", session.user.id)
		.single();

	if (orderData?.data == null || orderData?.data?.active == false) {
		redirect("/produkty");
	}

	const hasFine = await supabase
		.from("fine")
		.select("*")
		.eq("profile_id", session.user.id)
		.single();

	if(hasFine?.data != null) {
		redirect("/profil/pokuta")
	}

	return <main>{children}</main>;
}
