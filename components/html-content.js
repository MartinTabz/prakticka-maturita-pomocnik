"use client";

import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { useState, useEffect } from "react";
import TextStyle from "@tiptap/extension-text-style";
import { EditorContent, useEditor, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import ListItem from "@tiptap/extension-list-item";
import csharp from "highlight.js/lib/languages/csharp";
import js from "highlight.js/lib/languages/javascript";
import html from "highlight.js/lib/languages/xml";
import bash from "highlight.js/lib/languages/bash"
import { createLowlight } from "lowlight";
import CodeBlockComponent from "@components/code-block-component";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Color } from "@tiptap/extension-color";

const lowlight = createLowlight();
lowlight.register("html", html);
lowlight.register("csharp", csharp);
lowlight.register("bash", bash);
lowlight.register("js", js);

export default function HtmlContent({ html }) {
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
		content: html,
		editable: false,
	});

	return <EditorContent content={html} editor={editor} />;
}
