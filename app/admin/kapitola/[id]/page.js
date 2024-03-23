import { getServiceSupabase } from "@utils/supabase";
import EditChapterComponent from "@components/admin/edit-chapter-component";

export const dynamic = "force-dynamic";

export default async function EditChapterPage({ params: { id } }) {
	const supabase = getServiceSupabase();
	const { data: chapter } = await supabase
		.from("chapter")
		.select("*")
		.eq("id", id)
		.single();
	return <EditChapterComponent chapterData={chapter} />;
}
