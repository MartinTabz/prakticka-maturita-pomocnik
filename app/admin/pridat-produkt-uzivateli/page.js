import { getServiceSupabase } from "@utils/supabase";
import AssignProductComponent from "@components/admin/assign-product-component";

export default async function AssignProductToUser() {
	const supabase = getServiceSupabase();
	const { data: users, error: usersError } = await supabase
		.from("profile")
		.select("*");
	const { data: products, error: productsError } = await supabase
		.from("product")
		.select("*");

	if (productsError || usersError) {
		throw new Error("Něco se pokazilo");
	}

	return <AssignProductComponent products={products} users={users} />;
}
