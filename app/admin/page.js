import { getServiceSupabase } from "@utils/supabase";
import ProductDropdownComponent from "@components/admin/product-dropdown";
import NewDropdownComponent from "@components/admin/new-dropdown";
import Navigation from "@components/navigation";
import style from "@styles/admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
	const supabase = getServiceSupabase();

	const { data: productDetails } = await supabase
		.from("product")
		.select(
			`name, active, created_at, subject(id, name, slug, image, chapter(id, name, description))`
		);

	return (
		<div className={style.main}>
			<div className={style.inner}>
				<div className={style.top}>
					<h1>Administrace</h1>
					<NewDropdownComponent />
				</div>
				<ProductDropdownComponent products={productDetails} />
			</div>
		</div>
	);
}
