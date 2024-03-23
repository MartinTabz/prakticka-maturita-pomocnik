import { getServiceSupabase } from "@utils/supabase";
import NewSubjectComponent from "@components/admin/new-subject-component";

export const dynamic = "force-dynamic";

export default async function NewSubjectPage() {
	const supabase = getServiceSupabase();
	const { data: products } = await supabase.from("product").select("id, name, slug");
	return (
		<div>
			<h1>Nový předmět</h1>
			<NewSubjectComponent rawProducts={products} />
		</div>
	);
}
