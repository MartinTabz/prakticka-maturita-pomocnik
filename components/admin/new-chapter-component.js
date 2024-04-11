"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import style from "@styles/upload.module.css";
import crypto from "crypto";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import TextStyle from "@tiptap/extension-text-style";
import { EditorContent, useEditor, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import ListItem from "@tiptap/extension-list-item";
import { useRouter } from "next/navigation";
import csharp from "highlight.js/lib/languages/csharp";
import json from "highlight.js/lib/languages/json"
import js from "highlight.js/lib/languages/javascript";
import bash from "highlight.js/lib/languages/bash";
import html from "highlight.js/lib/languages/xml";
import { createLowlight } from "lowlight";
import CodeBlockComponent from "@components/code-block-component";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Color } from "@tiptap/extension-color";
import { HexColorPicker } from "react-colorful";
import { FaAngleDown } from "react-icons/fa6";
import { useNotifications } from "@utils/notificationcontext";
import {
	LuHeading1,
	LuCode2,
	LuPalette,
	LuPilcrow,
	LuHeading2,
	LuImage,
	LuItalic,
	LuBold,
	LuListOrdered,
	LuList,
} from "react-icons/lu";

const lowlight = createLowlight();
lowlight.register("html", html);
lowlight.register("csharp", csharp);
lowlight.register("bash", bash);
lowlight.register("js", js);
lowlight.register("json", json);

export default function NewChapterComponent({ products, selectedSubject }) {
	const { newError, newSuccess } = useNotifications();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [openedDropdown, setDropDown] = useState(false);

	const [chosenSubject, setChosenSubject] = useState(selectedSubject);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const [html, setHtml] = useState("<p></p>");

	const handleSave = async (e) => {
		e.preventDefault();
		setHtml(editor.getHTML());
		setIsLoading(true);

		try {
			const { data } = await axios.post("/api/admin/create-new-chapter", {
				name: name,
				description: description,
				subject: chosenSubject.id,
				html: editor.getHTML(),
			});
			if (data?.success) {
				newSuccess("Nová kapitola byla přidána");
				router.push("/admin");
			} else {
				newError("Něco se pokazilo, zkuste to později!");
			}
		} catch (error) {
			if (error?.response?.data?.error) {
				newError(error.response.data.error);
			} else {
				newError(error.message);
			}
		}

		setIsLoading(false);
	};

	const editor = useEditor({
		extensions: [
			Document,
			Paragraph,
			Text,
			Image,
			Color.configure({ types: [TextStyle.name, ListItem.name] }),
			TextStyle.configure({ types: [TextStyle.name] }),
			StarterKit.configure({
				bulletList: {
					keepMarks: true,
					keepAttributes: false,
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false,
				},
			}),
			CodeBlockLowlight.extend({
				addNodeView() {
					return ReactNodeViewRenderer(CodeBlockComponent);
				},
			}).configure({ lowlight }),
		],
		content: "<p></p>",
	});

	return (
		<div className={style.section}>
			<div className={style.area}>
				<h1>Nová kapitola</h1>
				<div
					className={style.dropdown}
					style={{
						borderRadius: openedDropdown ? "15px 15px 0 0" : "15px",
					}}
				>
					<div
						onClick={() => {
							if (!isLoading) {
								setDropDown(!openedDropdown);
							}
						}}
						className={style.dropdown_block}
					>
						<span>
							{products.length > 0
								? chosenSubject
									? chosenSubject.name
									: "Vybrat předmět"
								: "Nemáte zatím žádný produkt"}
						</span>
						<FaAngleDown
							style={{ transform: openedDropdown && "rotate(180deg)" }}
						/>
					</div>
					{openedDropdown && (
						<div className={style.dropdown_items}>
							{products.map((product, index) => (
								<div className={style.dropdown_item} key={index}>
									<h2>{product.name}</h2>
									<div className={style.dropdown_chapters}>
										{product.subject.length > 0
											? product.subject.map((s) => (
													<div
														onClick={() => {
															if (!isLoading) {
																setChosenSubject(s);
																setDropDown(false);
															}
														}}
														key={s.id}
													>
														{s.name}
													</div>
											  ))
											: "Tento produkt zatím nemá žádné"}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
				<div className={style.input_area}>
					<label>Název</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={isLoading}
					/>
				</div>
				<div className={style.input_area}>
					<label>Popis</label>
					<textarea
						type="text"
						value={description}
						disabled={isLoading}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>
				<div className={style.editor}>
					<MenuBar editor={editor} />
					{isLoading ? (
						<div
							className={style.editor_content}
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					) : (
						<EditorContent className={style.editor_content} editor={editor} />
					)}
				</div>
				<div className={style.upload}>
					<div className={style.upload_btn}>
						{isLoading ? (
							<FiLoader color={"white"} className={`loader`} />
						) : (
							<button onClick={handleSave}>Vložit</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

const MenuBar = ({ editor }) => {
	const supabase = createClientComponentClient();
	const { newError } = useNotifications();
	const [pickedColor, setPickedColor] = useState("#eb4034");
	const [openedColorPicker, setOpenedColorPicker] = useState(false);

	if (!editor) {
		return null;
	}

	const uploadFile = async (event) => {
		try {
			if (!event.target.files || event.target.files.length === 0) {
				newError("Musíte vybrat obrázek pro nahrání");
				return;
			}

			const file = event.target.files[0];

			if (file.size > 1048576) {
				newError("Obrázek je příliš velký (Max 1MB)");
				return;
			}

			let path;
			let attempts = 0;

			do {
				const fileExt = file.name.split(".").pop();
				const filePath = `${uuidv4()}-${crypto
					.randomBytes(16)
					.toString("hex")}.${fileExt}`;

				const { data: upload_data, error: upload_error } =
					await supabase.storage.from("chapters").upload(filePath, file);

				if (upload_error && !upload_error.error === "Duplicate") {
					console.log(upload_error);
					newError(upload_error.message);
					return;
				}

				if (upload_data.path) {
					path = upload_data.path;
				}
				attempts = attempts + 1;
			} while (!path || attempts >= 10);

			if (attempts >= 10) {
				newError("Něco se pokazilo při nahrávání obrázku");
				return;
			}

			if (path) {
				editor
					.chain()
					.focus()
					.setImage({
						src: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/chapters/${path}`,
					})
					.run();
			}
		} catch (error) {
			newError(error.message);
			return;
		}
	};

	return (
		<div className={style.editor_menu}>
			<button
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				className={editor.isActive("bold") ? style.active_btn : ""}
			>
				<LuBold />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				className={editor.isActive("italic") ? style.active_btn : ""}
			>
				<LuItalic />
			</button>
			<button
				onClick={() => editor.chain().focus().setParagraph().run()}
				className={editor.isActive("paragraph") ? style.is_active : ""}
			>
				<LuPilcrow />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				className={
					editor.isActive("heading", { level: 1 }) ? style.is_active : ""
				}
			>
				<LuHeading1 />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				className={
					editor.isActive("heading", { level: 2 }) ? style.is_active : ""
				}
			>
				<LuHeading2 />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={editor.isActive("bulletList") ? style.is_active : ""}
			>
				<LuList />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={editor.isActive("orderedList") ? style.is_active : ""}
			>
				<LuListOrdered />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				className={editor.isActive("codeBlock") ? "is-active" : ""}
			>
				<LuCode2 />
			</button>
			<div>
				<LuImage />
				<input
					type="file"
					accept="image/*"
					multiple={false}
					onChange={uploadFile}
				/>
			</div>
			<button
				onClick={() => editor.chain().focus().setColor(pickedColor).run()}
				className={
					editor.isActive("textStyle", { color: pickedColor })
						? style.is_active
						: ""
				}
			>
				<div
					style={{ backgroundColor: pickedColor }}
					className={style.colour_block}
				></div>
				{openedColorPicker && (
					<div className={style.color_picker}>
						<HexColorPicker color={pickedColor} onChange={setPickedColor} />
					</div>
				)}
			</button>
			<button
				onClick={() => setOpenedColorPicker(!openedColorPicker)}
				className={openedColorPicker ? style.is_active : ""}
			>
				<LuPalette />
			</button>
		</div>
	);
};

