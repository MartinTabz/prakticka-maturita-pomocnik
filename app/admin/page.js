import { getServiceSupabase } from "@utils/supabase";
import ProductDropdownComponent from "@components/admin/product-dropdown";
import Link from "next/link";
import NewDropdownComponent from "@components/admin/new-dropdown";

export default async function AdminPage() {
	const supabase = getServiceSupabase();

	const { data: productDetails } = await supabase
		.from("product")
		.select(
			`name, active, created_at, subject(name, slug, image, chapter(id, name, description))`
		);

	return (
		<div>
			<div>
				<h1>Administrace</h1>
				<NewDropdownComponent />
			</div>
			<ProductDropdownComponent products={productDetails} />
		</div>
	);
}
