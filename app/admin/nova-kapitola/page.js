import { getServiceSupabase } from "@utils/supabase";
import NewChapterComponent from "@components/admin/new-chapter-component";

export const dynamic = "force-dynamic";

export default async function NewChapterPage() {
	const supabase = getServiceSupabase();
	const { data: products } = await supabase
		.from("product")
		.select(`name, subject(name, id)`);
	return (
		<div>
         <NewChapterComponent products={products} />
		</div>
	);
}
