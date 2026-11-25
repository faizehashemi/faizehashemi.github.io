import { f as e, h as t, i as n, n as r, o as i, p as a, s as o, u as s } from "./PmsContext-BVMd13Oi.js";
import { a as c, n as l, o as u, r as d, t as f } from "./dialog-DtgtvZ4Q.js";
import { t as p } from "./checkbox-C3tIiLfF.js";
import { t as m } from "./label-CMEyi--P.js";
import { t as h } from "./slider-Db2mTvMK.js";
import { t as g } from "./createLucideIcon-CQUC5AEZ.js";
import { n as ee, t as _ } from "./chevron-up-CnW0SoV4.js";
import { t as te } from "./trash-8ywHN_MU.js";
import { t as ne } from "./undo-2-WssTO3qI.js";
import { t as v } from "./button-BGWa3SLr.js";
import { t as y } from "./card-B9_OGomP.js";
import { t as b } from "./input-DSBk_UeU.js";
import { t as x } from "./utils-b7UP9Cmo.js";
import { t as re } from "./ConfirmDialog-GfriOiUy.js";
import { t as S } from "./badge-EB7Muw37.js";
import { t as C } from "./textarea-BxHERF6b.js";
// node_modules/lucide-react/dist/esm/icons/redo-2.mjs
var ie = {
	name: "redo-2",
	size: 24,
	node: [["path", {
		d: "m15 14 5-5-5-5",
		key: "12vg1m"
	}], ["path", {
		d: "M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13",
		key: "6uklza"
	}]]
};
ie.node;
var ae = g(ie), w = /* @__PURE__ */ t(a(), 1), T = e(), E = "grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-1.5 text-xs font-semibold", oe = (e) => /^#[0-9a-f]{6}$/i.test(String(e || "")) ? String(e) : "#ffffff";
function D({ label: e, value: t, onChange: n, min: r = 0, max: i = 4e3, disabled: a, as: o, none: s }) {
	return o === "color" ? /* @__PURE__ */ (0, T.jsxs)("label", {
		className: E,
		children: [e, /* @__PURE__ */ (0, T.jsxs)("span", {
			className: "flex items-center gap-1.5",
			children: [/* @__PURE__ */ (0, T.jsx)("input", {
				type: "color",
				className: "h-8 w-14 rounded border",
				disabled: a || s && !t,
				value: oe(t),
				onChange: (e) => n(e.target.value)
			}), s && /* @__PURE__ */ (0, T.jsxs)("label", {
				className: "flex items-center gap-1 font-normal",
				children: [/* @__PURE__ */ (0, T.jsx)("input", {
					type: "checkbox",
					checked: !t,
					disabled: a,
					onChange: (e) => n(e.target.checked ? "" : oe(t))
				}), " none"]
			})]
		})]
	}) : /* @__PURE__ */ (0, T.jsxs)("label", {
		className: E,
		children: [e, /* @__PURE__ */ (0, T.jsx)(b, {
			type: "number",
			className: "h-8",
			min: r,
			max: i,
			disabled: a,
			value: t == null ? "" : String(t),
			onChange: (e) => n(e.target.value === "" ? null : Number(e.target.value))
		})]
	});
}
function O({ label: e, value: t, list: n, onChange: r, disabled: i }) {
	return /* @__PURE__ */ (0, T.jsxs)("label", {
		className: E,
		children: [e, /* @__PURE__ */ (0, T.jsx)("select", {
			className: "h-8 min-w-0 rounded-md border bg-background px-1.5 text-sm font-normal",
			disabled: i,
			value: String(t ?? ""),
			onChange: (e) => r(e.target.value),
			children: n.map(([e, t]) => /* @__PURE__ */ (0, T.jsx)("option", {
				value: e,
				children: t
			}, e))
		})]
	});
}
function k({ label: e, value: t, onChange: n, disabled: r }) {
	return /* @__PURE__ */ (0, T.jsxs)("label", {
		className: "flex items-center gap-2 text-xs",
		children: [/* @__PURE__ */ (0, T.jsx)(p, {
			checked: !!t,
			disabled: r,
			onCheckedChange: (e) => n(e === !0)
		}), e]
	});
}
function A({ label: e, value: t, onChange: n, disabled: r }) {
	return /* @__PURE__ */ (0, T.jsxs)("label", {
		className: "grid gap-1 text-xs font-semibold",
		children: [e, /* @__PURE__ */ (0, T.jsx)(C, {
			className: "min-h-16 text-sm font-normal",
			disabled: r,
			value: String(t ?? ""),
			onChange: (e) => n(e.target.value)
		})]
	});
}
function se({ c: e, fields: t, fonts: n, onSet: r, onDelete: i, onDragStart: a, onDrop: o, disabled: s }) {
	let [c, l] = (0, w.useState)(!1), [u, d] = (0, w.useState)(e.title ?? "");
	return (0, w.useEffect)(() => d(e.title ?? ""), [e.title]), /* @__PURE__ */ (0, T.jsxs)("div", {
		className: "grid grid-cols-[1.2rem_1fr_auto] items-center gap-1 rounded-lg border bg-card p-1.5 " + (c ? "border-gold shadow-[inset_0_3px_0_var(--gold)]" : ""),
		onDragOver: (e) => {
			e.preventDefault(), l(!0);
		},
		onDragLeave: () => l(!1),
		onDrop: (e) => {
			e.preventDefault(), l(!1), o();
		},
		children: [
			/* @__PURE__ */ (0, T.jsx)("span", {
				className: "cursor-grab select-none text-center text-muted-foreground",
				draggable: !s,
				title: "Drag to reorder",
				onDragStart: (e) => {
					e.dataTransfer.setData("text/plain", "col"), e.dataTransfer.effectAllowed = "move", a();
				},
				children: "⠿"
			}),
			/* @__PURE__ */ (0, T.jsx)("select", {
				"aria-label": "Data",
				className: "h-8 min-w-0 rounded-md border bg-background px-1 text-sm",
				disabled: s,
				value: e.field,
				onChange: (e) => r("field", e.target.value),
				children: Object.entries(t).map(([e, [t]]) => /* @__PURE__ */ (0, T.jsx)("option", {
					value: e,
					children: t
				}, e))
			}),
			/* @__PURE__ */ (0, T.jsx)("button", {
				type: "button",
				className: "px-1 text-destructive",
				title: "Remove column",
				"aria-label": "Remove column",
				disabled: s,
				onClick: i,
				children: "✕"
			}),
			/* @__PURE__ */ (0, T.jsxs)("div", {
				className: "col-span-2 col-start-2 grid grid-cols-[1fr_5rem_3.5rem] gap-1",
				children: [
					/* @__PURE__ */ (0, T.jsx)(b, {
						className: "h-8",
						"aria-label": "Title",
						placeholder: "Title",
						disabled: s,
						value: u,
						onChange: (e) => {
							d(e.target.value), r("title", e.target.value);
						}
					}),
					/* @__PURE__ */ (0, T.jsxs)("select", {
						"aria-label": "Align",
						className: "h-8 rounded-md border bg-background px-1 text-sm",
						disabled: s,
						value: e.align || "center",
						onChange: (e) => r("align", e.target.value),
						children: [
							/* @__PURE__ */ (0, T.jsx)("option", {
								value: "left",
								children: "Left"
							}),
							/* @__PURE__ */ (0, T.jsx)("option", {
								value: "center",
								children: "Centre"
							}),
							/* @__PURE__ */ (0, T.jsx)("option", {
								value: "right",
								children: "Right"
							})
						]
					}),
					/* @__PURE__ */ (0, T.jsx)(b, {
						className: "h-8 px-1",
						type: "number",
						min: 0,
						max: 100,
						"aria-label": "Width %",
						placeholder: "w %",
						disabled: s,
						value: e.width ?? "",
						onChange: (e) => r("width", e.target.value === "" ? null : Number(e.target.value))
					})
				]
			}),
			/* @__PURE__ */ (0, T.jsxs)("div", {
				className: "col-span-2 col-start-2 grid grid-cols-[minmax(0,1fr)_3.5rem_auto_auto] items-center gap-1",
				children: [
					/* @__PURE__ */ (0, T.jsxs)("select", {
						"aria-label": "Column font",
						className: "h-8 min-w-0 rounded-md border bg-background px-1 text-sm",
						disabled: s,
						value: e.font || "",
						onChange: (e) => r("font", e.target.value),
						children: [/* @__PURE__ */ (0, T.jsx)("option", {
							value: "",
							children: "Table font"
						}), n.map(([e, t]) => /* @__PURE__ */ (0, T.jsx)("option", {
							value: e,
							children: t
						}, e))]
					}),
					/* @__PURE__ */ (0, T.jsx)(b, {
						className: "h-8 px-1",
						type: "number",
						min: 8,
						max: 120,
						"aria-label": "Column text size",
						placeholder: "size",
						disabled: s,
						value: e.size ?? "",
						onChange: (e) => r("size", e.target.value === "" ? null : Number(e.target.value))
					}),
					/* @__PURE__ */ (0, T.jsxs)("label", {
						className: "flex items-center gap-1 text-xs font-bold",
						title: "Bold",
						children: [/* @__PURE__ */ (0, T.jsx)(p, {
							checked: !!e.bold,
							disabled: s,
							onCheckedChange: (e) => r("bold", e === !0)
						}), "B"]
					}),
					/* @__PURE__ */ (0, T.jsxs)("span", {
						className: "flex items-center gap-1",
						title: "Text colour of this column",
						children: [/* @__PURE__ */ (0, T.jsx)("input", {
							type: "color",
							"aria-label": "Column text colour",
							className: "h-8 w-8 rounded border",
							disabled: s,
							value: oe(e.color || "#000000"),
							onChange: (e) => r("color", e.target.value)
						}), e.color && /* @__PURE__ */ (0, T.jsx)("button", {
							type: "button",
							className: "text-xs text-muted-foreground",
							title: "Back to the table's colour",
							"aria-label": "Clear column colour",
							disabled: s,
							onClick: () => r("color", ""),
							children: "✕"
						})]
					})
				]
			})
		]
	});
}
async function ce(e, t) {
	let n = await new Promise((t, n) => {
		let r = new FileReader();
		r.onload = () => t(String(r.result)), r.onerror = n, r.readAsDataURL(e);
	});
	if (e.size < 25e4 && /^data:image\/(png|jpeg|webp|gif);/.test(n)) return n;
	let r = await new Promise((e, t) => {
		let r = new Image();
		r.onload = () => e(r), r.onerror = t, r.src = n;
	}), i = Math.min(1, t / Math.max(r.naturalWidth, r.naturalHeight)), a = document.createElement("canvas");
	return a.width = Math.round(r.naturalWidth * i), a.height = Math.round(r.naturalHeight * i), a.getContext("2d").drawImage(r, 0, 0, a.width, a.height), a.toDataURL("image/webp", .82);
}
// src/pages/signage-builder/NoticeTable.tsx
function j(e) {
	return String(e || "").split("\n").map((e) => e.trim()).filter(Boolean).map((e) => {
		let t = e.startsWith("#");
		return {
			head: t,
			cells: (t ? e.slice(1) : e).split("|").map((e) => e.trim())
		};
	});
}
function M(e) {
	return e.filter((e) => e.cells.some((e) => e.trim()) || e.head).map((e) => (e.head ? "# " : "") + e.cells.map((e) => e.replace(/\|/g, "/")).join(" | ")).join("\n");
}
var N = (e, t) => e.startsWith(t) && e.endsWith(t) && e.length >= t.length * 2, P = (e, t) => N(e, t) ? e.slice(t.length, -t.length) : e && `${t}${e}${t}`, le = (e) => {
	let t = e;
	for (let e = 0; e < 3; e++) for (let e of [
		"**",
		"!!",
		"__"
	]) N(t, e) && (t = t.slice(e.length, -e.length));
	return t;
};
function F({ value: e, onChange: t, disabled: n }) {
	let [r, i] = (0, w.useState)(!1), [a, o] = (0, w.useState)(() => j(e)), [s, c] = (0, w.useState)(null);
	(0, w.useEffect)(() => {
		M(a) !== String(e || "").split("\n").map((e) => e.trim()).filter(Boolean).join("\n") && o(j(e));
	}, [e]);
	let l = Math.max(1, ...a.map((e) => e.head && e.cells.length === 1 ? 1 : e.cells.length)), u = (e) => {
		o(e), t(M(e));
	}, d = (e) => {
		let t = a.map((e) => ({
			head: e.head,
			cells: [...e.cells]
		}));
		e(t), u(t);
	}, f = s ? a[s[0]]?.cells[s[1]] ?? "" : "";
	return r ? /* @__PURE__ */ (0, T.jsxs)("div", {
		className: "grid gap-1 text-xs font-semibold",
		children: [/* @__PURE__ */ (0, T.jsxs)("div", {
			className: "flex items-center justify-between",
			children: ["Table (as text)", /* @__PURE__ */ (0, T.jsx)("button", {
				type: "button",
				className: "font-normal text-primary underline",
				onClick: () => {
					o(j(e)), i(!1);
				},
				children: "Edit as a grid"
			})]
		}), /* @__PURE__ */ (0, T.jsx)(C, {
			className: "min-h-24 font-mono text-xs font-normal",
			disabled: n,
			value: e,
			onChange: (e) => t(e.target.value)
		})]
	}) : /* @__PURE__ */ (0, T.jsxs)("div", {
		className: "grid gap-1.5 text-xs",
		children: [
			/* @__PURE__ */ (0, T.jsxs)("div", {
				className: "flex items-center justify-between font-semibold",
				children: ["Table ", /* @__PURE__ */ (0, T.jsxs)("span", {
					className: "flex gap-3 font-normal",
					children: [a.length > 0 && /* @__PURE__ */ (0, T.jsx)("button", {
						type: "button",
						className: "text-destructive underline",
						disabled: n,
						onClick: () => u([]),
						children: "Remove table"
					}), /* @__PURE__ */ (0, T.jsx)("button", {
						type: "button",
						className: "text-primary underline",
						onClick: () => i(!0),
						children: "Edit as text"
					})]
				})]
			}),
			a.length ? /* @__PURE__ */ (0, T.jsx)("div", {
				className: "overflow-x-auto rounded-md border",
				children: /* @__PURE__ */ (0, T.jsx)("table", {
					className: "w-full border-collapse",
					children: /* @__PURE__ */ (0, T.jsx)("tbody", { children: a.map((e, t) => /* @__PURE__ */ (0, T.jsxs)("tr", {
						className: e.head ? "bg-sky-100 dark:bg-sky-950" : "",
						children: [
							/* @__PURE__ */ (0, T.jsx)("td", {
								className: "w-8 border-r px-1 text-center",
								children: /* @__PURE__ */ (0, T.jsx)("button", {
									type: "button",
									title: e.head ? "Heading row (click for a normal row)" : "Make this a heading row",
									disabled: n,
									className: x("rounded px-1 font-bold", e.head ? "bg-sky-600 text-white" : "text-muted-foreground"),
									onClick: () => d((e) => {
										e[t].head = !e[t].head;
									}),
									children: "H"
								})
							}),
							(e.head && e.cells.length === 1 ? [0] : Array.from({ length: l }, (e, t) => t)).map((r) => {
								let i = e.cells[r] ?? "", a = i === "^";
								return /* @__PURE__ */ (0, T.jsx)("td", {
									colSpan: e.head && e.cells.length === 1 ? l : 1,
									className: x("min-w-24 border p-0.5", s && s[0] === t && s[1] === r && "ring-2 ring-primary ring-inset"),
									children: a ? /* @__PURE__ */ (0, T.jsx)("button", {
										type: "button",
										className: "h-8 w-full rounded bg-muted text-muted-foreground",
										title: "Joined with the cell above — click to edit this cell",
										disabled: n,
										onClick: () => {
											d((e) => {
												e[t].cells[r] = "";
											}), c([t, r]);
										},
										children: "⤒ joined"
									}) : /* @__PURE__ */ (0, T.jsx)(b, {
										className: x("h-8 border-0 px-1.5 shadow-none", i.includes("**") && "font-bold", i.includes("!!") && "text-red-600"),
										disabled: n,
										value: le(i),
										onFocus: () => c([t, r]),
										onChange: (e) => d((n) => {
											for (; n[t].cells.length <= r;) n[t].cells.push("");
											let i = n[t].cells[r], a = e.target.value;
											for (let e of [
												"**",
												"!!",
												"__"
											]) i.includes(e) && (a = `${e}${a}${e}`);
											n[t].cells[r] = a;
										})
									})
								}, r);
							}),
							/* @__PURE__ */ (0, T.jsx)("td", {
								className: "w-7 border-l text-center",
								children: /* @__PURE__ */ (0, T.jsx)("button", {
									type: "button",
									"aria-label": "Remove row",
									title: "Remove row",
									disabled: n,
									className: "text-destructive",
									onClick: () => {
										d((e) => {
											e.splice(t, 1);
										}), c(null);
									},
									children: "✕"
								})
							})
						]
					}, t)) })
				})
			}) : /* @__PURE__ */ (0, T.jsx)("p", {
				className: "text-muted-foreground",
				children: "No table in this section."
			}),
			!n && /* @__PURE__ */ (0, T.jsxs)("div", {
				className: "flex flex-wrap gap-1",
				children: [
					/* @__PURE__ */ (0, T.jsx)(v, {
						size: "sm",
						variant: "outline",
						className: "h-7",
						onClick: () => d((e) => {
							e.push({
								head: !1,
								cells: Array.from({ length: l }, () => "")
							});
						}),
						children: "＋ Row"
					}),
					/* @__PURE__ */ (0, T.jsx)(v, {
						size: "sm",
						variant: "outline",
						className: "h-7",
						onClick: () => d((e) => {
							e.push({
								head: !0,
								cells: ["Heading"]
							});
						}),
						children: "＋ Heading row"
					}),
					/* @__PURE__ */ (0, T.jsx)(v, {
						size: "sm",
						variant: "outline",
						className: "h-7",
						disabled: !a.length,
						onClick: () => d((e) => {
							e.forEach((e) => {
								if (!(e.head && e.cells.length === 1)) {
									for (; e.cells.length < l;) e.cells.push("");
									e.cells.push("");
								}
							});
						}),
						children: "＋ Column"
					}),
					/* @__PURE__ */ (0, T.jsx)(v, {
						size: "sm",
						variant: "outline",
						className: "h-7",
						disabled: l < 2,
						onClick: () => d((e) => {
							e.forEach((e) => {
								!(e.head && e.cells.length === 1) && e.cells.length >= l && e.cells.splice(l - 1, 1);
							});
						}),
						children: "− Last column"
					}),
					s && a[s[0]] && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
						/* @__PURE__ */ (0, T.jsx)("span", {
							className: "mx-1 self-center text-muted-foreground",
							children: "Cell:"
						}),
						/* @__PURE__ */ (0, T.jsx)(v, {
							size: "sm",
							variant: "outline",
							className: x("h-7 font-bold", f.includes("**") && "bg-accent"),
							onClick: () => d((e) => {
								e[s[0]].cells[s[1]] = P(e[s[0]].cells[s[1]] ?? "", "**");
							}),
							children: "B"
						}),
						/* @__PURE__ */ (0, T.jsx)(v, {
							size: "sm",
							variant: "outline",
							className: x("h-7 text-red-600", f.includes("!!") && "bg-accent"),
							onClick: () => d((e) => {
								e[s[0]].cells[s[1]] = P(e[s[0]].cells[s[1]] ?? "", "!!");
							}),
							children: "Red"
						}),
						s[0] > 0 && !a[s[0]].head && /* @__PURE__ */ (0, T.jsx)(v, {
							size: "sm",
							variant: "outline",
							className: "h-7",
							title: "Join this cell with the one above (one tall cell)",
							onClick: () => d((e) => {
								e[s[0]].cells[s[1]] = "^";
							}),
							children: "⤒ Join with above"
						})
					] })
				]
			}),
			/* @__PURE__ */ (0, T.jsxs)("p", {
				className: "text-muted-foreground",
				children: [
					"Click a cell to type. ",
					/* @__PURE__ */ (0, T.jsx)("b", { children: "H" }),
					" makes a heading row; a heading row with one cell spans the table."
				]
			})
		]
	});
}
// src/pages/signage-builder/DesignEditor.tsx
var I = 1080, L = 1920, R = (e) => JSON.parse(JSON.stringify(e)), z = () => Math.random().toString(36).slice(2, 10), ue = (e) => Object.fromEntries(e.split(";").map((e) => e.trim()).filter(Boolean).map((e) => {
	let t = e.indexOf(":");
	return [e.slice(0, t).trim().replace(/-([a-z])/g, (e, t) => t.toUpperCase()), e.slice(t + 1).trim()];
})), de = /* @__PURE__ */ "📌.📢.⚠️.✅.❌.ℹ️.🕋.🕌.📿.🤲.🍽️.🥐.🍛.🍲.☕.🚌.🚐.✈️.🧳.🛏️.🔑.📶.🧺.💳.📱.☎️.📍.🕒.📅.⭐.❤️.👉.⬅️.➡️.⬆️.⬇️".split("."), fe = [
	"#111111",
	"#ffffff",
	"#c8102e",
	"#e8590c",
	"#f59f00",
	"#2b8a3e",
	"#0f6b4c",
	"#1d4ed8",
	"#1d6fe0",
	"#6741d9",
	"#8a6a1f",
	"#f5d78e",
	"#dcebfb",
	"#fdf8ee",
	"#6b7280"
], pe = {
	text: (e, t) => ({
		type: "text",
		x: e,
		y: t,
		w: 700,
		h: 120,
		text: "Double-click to type",
		font: "Poppins",
		size: 48,
		color: "#111111",
		align: "left",
		valign: "middle"
	}),
	title: (e, t) => ({
		type: "text",
		x: e,
		y: t,
		w: 900,
		h: 160,
		text: "Title",
		font: "Playfair Display",
		size: 96,
		bold: !0,
		color: "#0b1020",
		align: "center",
		valign: "middle"
	}),
	rect: (e, t) => ({
		type: "shape",
		shape: "rect",
		x: e,
		y: t,
		w: 600,
		h: 300,
		fill: "#1d6fe0",
		radius: 24
	}),
	ellipse: (e, t) => ({
		type: "shape",
		shape: "ellipse",
		x: e,
		y: t,
		w: 360,
		h: 360,
		fill: "#f5d78e"
	}),
	line: (e, t) => ({
		type: "shape",
		shape: "rect",
		x: e,
		y: t,
		w: 800,
		h: 10,
		fill: "#111111",
		radius: 5
	}),
	table: (e, t) => ({
		type: "table",
		x: e,
		y: t,
		w: 900,
		h: 420,
		cells: [
			[
				"Heading",
				"Heading",
				"Heading"
			],
			[
				"",
				"",
				""
			],
			[
				"",
				"",
				""
			],
			[
				"",
				"",
				""
			]
		],
		head: !0,
		font: "Arial",
		size: 36,
		headBg: "#1d4ed8",
		headColor: "#ffffff",
		cellBg: "#dbeafe",
		color: "#111111",
		line: "#ffffff",
		radius: 12
	}),
	clock: (e, t) => ({
		type: "clock",
		fmt: "time12",
		x: e,
		y: t,
		w: 560,
		h: 160,
		font: "Montserrat",
		size: 110,
		bold: !0,
		color: "#0b1020",
		align: "center",
		valign: "middle"
	}),
	date: (e, t) => ({
		type: "clock",
		fmt: "day",
		x: e,
		y: t,
		w: 800,
		h: 110,
		font: "Poppins",
		size: 54,
		color: "#0b1020",
		align: "center",
		valign: "middle"
	})
};
function B({ on: e, title: t, onClick: n, children: r, disabled: i, dis: a }) {
	return /* @__PURE__ */ (0, T.jsx)("button", {
		type: "button",
		title: t,
		"aria-label": t,
		disabled: a || i,
		onClick: n,
		className: x("h-8 min-w-8 rounded-md border bg-background px-2 text-sm hover:border-gold disabled:opacity-40", e && "border-gold bg-accent font-bold"),
		children: r
	});
}
function V({ value: e, onPick: t, title: n, none: r, dis: i }) {
	return /* @__PURE__ */ (0, T.jsxs)("span", {
		className: "group relative inline-flex",
		children: [/* @__PURE__ */ (0, T.jsxs)("label", {
			title: n,
			className: "flex h-8 cursor-pointer items-center gap-1 rounded-md border bg-background px-1.5 text-xs",
			children: [
				/* @__PURE__ */ (0, T.jsx)("span", {
					className: "size-5 rounded border",
					style: {
						background: e || "transparent",
						backgroundImage: e ? void 0 : "linear-gradient(135deg,#fff 45%,#e11 50%,#fff 55%)"
					}
				}),
				n,
				/* @__PURE__ */ (0, T.jsx)("input", {
					type: "color",
					className: "sr-only",
					disabled: i,
					value: /^#[0-9a-f]{6}$/i.test(e || "") ? e : "#ffffff",
					onChange: (e) => t(e.target.value)
				})
			]
		}), /* @__PURE__ */ (0, T.jsxs)("span", {
			className: "invisible absolute left-0 top-8 z-30 grid w-44 grid-cols-5 gap-1 rounded-lg border bg-popover p-1.5 shadow-lg group-hover:visible",
			children: [fe.map((e) => /* @__PURE__ */ (0, T.jsx)("button", {
				type: "button",
				title: e,
				className: "size-7 rounded border",
				style: { background: e },
				onClick: () => t(e)
			}, e)), r && /* @__PURE__ */ (0, T.jsx)("button", {
				type: "button",
				className: "col-span-5 rounded border text-xs",
				onClick: () => t(""),
				children: "None"
			})]
		})]
	});
}
function me({ design: e, onChange: t, S: n, url: r, uploadFile: i, dis: a }) {
	let o = (0, w.useMemo)(() => ({
		...e,
		elements: e.elements || []
	}), [e]), [s, c] = (0, w.useState)([]), [l, u] = (0, w.useState)(null), [d, f] = (0, w.useState)(null), [p, m] = (0, w.useState)({
		x: [],
		y: []
	}), [h, g] = (0, w.useState)(.3), [ee, _] = (0, w.useState)(""), [te, ne] = (0, w.useState)(!1), v = (0, w.useRef)([]), y = (0, w.useRef)([]), b = (0, w.useRef)([]), x = (0, w.useRef)(o);
	x.current = o;
	let re = (0, w.useRef)(null), S = (0, w.useRef)(null), C = (0, w.useRef)(null), [, ie] = (0, w.useState)(0);
	(0, w.useLayoutEffect)(() => {
		let e = () => {
			let e = re.current;
			if (!e) return;
			let t = e.clientWidth, n = Math.max(420, window.innerHeight - 260);
			g(Math.max(.15, Math.min(t / I, n / L)));
		};
		e();
		let t = new ResizeObserver(e);
		return re.current && t.observe(re.current), addEventListener("resize", e), () => {
			t.disconnect(), removeEventListener("resize", e);
		};
	}, []);
	let ae = () => {
		v.current.push(R(x.current)), v.current.length > 100 && v.current.shift(), y.current = [], ie((e) => e + 1);
	}, E = (e, n = !0) => {
		let r = R(x.current);
		e(r), n && ae(), t(r);
	}, oe = () => {
		let e = v.current.pop();
		e && (y.current.push(R(x.current)), t(e), c((t) => t.filter((t) => e.elements.some((e) => e.id === t))), ie((e) => e + 1));
	}, D = () => {
		let e = y.current.pop();
		e && (v.current.push(R(x.current)), t(e), ie((e) => e + 1));
	}, O = o.elements.filter((e) => s.includes(e.id)), k = O.length === 1 ? O[0] : null, A = (e) => E((t) => {
		for (let n of t.elements) s.includes(n.id) && Object.assign(n, e);
	}), se = (e) => {
		let t = {
			id: z(),
			...e
		};
		return E((e) => {
			e.elements.push(t);
		}), c([t.id]), t;
	}, ce = (e) => {
		let t = pe[e], n = t(0, 0);
		se({
			...n,
			x: Math.round((I - n.w) / 2),
			y: Math.round((L - n.h) / 2)
		});
	};
	async function j(e, t) {
		let n = /^video\//.test(e.type);
		if (/^image\//.test(e.type) || n) {
			_(`Adding ${e.name}…`);
			try {
				let r = await i(e), a = n ? {
					w: 960,
					h: 540
				} : await new Promise((t) => {
					let n = new Image();
					n.onload = () => {
						let e = Math.min(800 / n.naturalWidth, 800 / n.naturalHeight, 1.5);
						t({
							w: Math.round(n.naturalWidth * e),
							h: Math.round(n.naturalHeight * e)
						});
					}, n.onerror = () => t({
						w: 600,
						h: 600
					}), n.src = URL.createObjectURL(e);
				}), o = t ? t.x - a.w / 2 : (I - a.w) / 2, s = t ? t.y - a.h / 2 : (L - a.h) / 2;
				se({
					type: n ? "video" : "image",
					src: r,
					fit: "cover",
					x: Math.round(o),
					y: Math.round(s),
					...a
				});
			} catch (e) {
				_("Could not add the file: " + (e.message || e));
				return;
			}
			_("");
		}
	}
	let M = (e, t) => {
		let n = document.createElement("input");
		n.type = "file", n.accept = e, n.onchange = () => {
			let e = n.files?.[0];
			e && t(e);
		}, n.click();
	}, N = (e, t) => {
		let n = S.current.getBoundingClientRect();
		return {
			x: (e - n.left) / h,
			y: (t - n.top) / h
		};
	}, P = (e, t) => {
		let n = 7 / h, r = [
			0,
			I / 2,
			I,
			...t.flatMap((e) => [
				e.x,
				e.x + e.w / 2,
				e.x + e.w
			])
		], i = [
			0,
			L / 2,
			L,
			...t.flatMap((e) => [
				e.y,
				e.y + e.h / 2,
				e.y + e.h
			])
		], a = 0, o = 0, s = [], c = [], l = n;
		for (let t of r) for (let n of [
			e.x,
			e.x + e.w / 2,
			e.x + e.w
		]) Math.abs(t - n) < l && (l = Math.abs(t - n), a = t - n, s[0] = t);
		l = n;
		for (let t of i) for (let n of [
			e.y,
			e.y + e.h / 2,
			e.y + e.h
		]) Math.abs(t - n) < l && (l = Math.abs(t - n), o = t - n, c[0] = t);
		return {
			dx: a,
			dy: o,
			gx: s.filter((e) => e != null),
			gy: c.filter((e) => e != null)
		};
	};
	function le(e, n) {
		if (a || e.button !== 0 || (e.stopPropagation(), l === n.id)) return;
		u(null), f(null);
		let r = s;
		if (e.shiftKey) {
			r = s.includes(n.id) ? s.filter((e) => e !== n.id) : [...s, n.id], c(r);
			return;
		}
		s.includes(n.id) || (r = [n.id], c(r));
		let i = N(e.clientX, e.clientY), o = R(x.current), d = o.elements.filter((e) => r.includes(e.id)), p = o.elements.filter((e) => !r.includes(e.id) && !e.locked);
		if (d.some((e) => e.locked)) return;
		let g = {
			x: Math.min(...d.map((e) => e.x)),
			y: Math.min(...d.map((e) => e.y)),
			w: 0,
			h: 0
		};
		g.w = Math.max(...d.map((e) => e.x + e.w)) - g.x, g.h = Math.max(...d.map((e) => e.y + e.h)) - g.y;
		let ee = !1, _ = (e) => {
			let n = N(e.clientX, e.clientY), a = n.x - i.x, s = n.y - i.y;
			if (!ee && Math.hypot(a, s) * h < 3) return;
			ee ||= (v.current.push(o), y.current = [], !0);
			let c = e.altKey ? {
				dx: 0,
				dy: 0,
				gx: [],
				gy: []
			} : P({
				...g,
				x: g.x + a,
				y: g.y + s
			}, p);
			a += c.dx, s += c.dy, m({
				x: c.gx,
				y: c.gy
			});
			let l = R(o);
			for (let e of l.elements) if (r.includes(e.id)) {
				let t = o.elements.find((t) => t.id === e.id);
				e.x = Math.round(t.x + a), e.y = Math.round(t.y + s);
			}
			t(l);
		}, te = () => {
			removeEventListener("pointermove", _), removeEventListener("pointerup", te), m({
				x: [],
				y: []
			}), ie((e) => e + 1);
		};
		addEventListener("pointermove", _), addEventListener("pointerup", te);
	}
	function F(e, n, r) {
		e.stopPropagation(), e.preventDefault();
		let i = R(x.current), a = i.elements.find((e) => e.id === n.id), o = N(e.clientX, e.clientY), s = a.w / a.h;
		v.current.push(i), y.current = [];
		let c = a.type === "image" || a.type === "video" || a.shape === "ellipse", l = (e) => {
			let l = N(e.clientX, e.clientY), u = l.x - o.x, d = l.y - o.y, { x: f, y: p, w: m, h } = a;
			if (r.includes("e") && (m = a.w + u), r.includes("s") && (h = a.h + d), r.includes("w") && (m = a.w - u, f = a.x + u), r.includes("n") && (h = a.h - d, p = a.y + d), c !== e.shiftKey && r.length === 2) {
				let e = m / s;
				r.includes("n") && (p = a.y + a.h - e), h = e;
			}
			m = Math.max(10, m), h = Math.max(6, h);
			let g = R(i);
			Object.assign(g.elements.find((e) => e.id === n.id), {
				x: Math.round(f),
				y: Math.round(p),
				w: Math.round(m),
				h: Math.round(h)
			}), t(g);
		}, u = () => {
			removeEventListener("pointermove", l), removeEventListener("pointerup", u), ie((e) => e + 1);
		};
		addEventListener("pointermove", l), addEventListener("pointerup", u);
	}
	function fe(e, n) {
		e.stopPropagation(), e.preventDefault();
		let r = R(x.current);
		v.current.push(r), y.current = [];
		let i = n.x + n.w / 2, a = n.y + n.h / 2, o = (e) => {
			let o = N(e.clientX, e.clientY), s = Math.atan2(o.y - a, o.x - i) * 180 / Math.PI + 90;
			s = (s % 360 + 360) % 360, s > 180 && (s -= 360);
			let c = e.shiftKey ? 15 : 0;
			if (c) s = Math.round(s / c) * c;
			else for (let e of [
				-180,
				-90,
				0,
				90,
				180
			]) Math.abs(s - e) < 4 && (s = e);
			let l = R(r);
			l.elements.find((e) => e.id === n.id).rot = Math.round(s) === 0 ? 0 : Math.round(s), t(l);
		}, s = () => {
			removeEventListener("pointermove", o), removeEventListener("pointerup", s), ie((e) => e + 1);
		};
		addEventListener("pointermove", o), addEventListener("pointerup", s);
	}
	function me(e, t) {
		if (!a) {
			if (e.stopPropagation(), t.type === "text") c([t.id]), u(t.id);
			else {
				if (t.type === "table") {
					let n = e.target.closest("[data-cell]");
					if (!n) return;
					let [r, i] = n.dataset.cell.split(":").map(Number), a = n.getBoundingClientRect(), o = S.current.getBoundingClientRect();
					c([t.id]), f({
						id: t.id,
						r,
						c: i,
						box: [
							(a.left - o.left) / h,
							(a.top - o.top) / h,
							a.width / h,
							a.height / h
						]
					});
				}
				(t.type === "image" || t.type === "video") && M(t.type === "video" ? "video/mp4,video/webm" : "image/*", async (e) => {
					_("Replacing…");
					try {
						let n = await i(e);
						E((e) => {
							e.elements.find((e) => e.id === t.id).src = n;
						});
					} finally {
						_("");
					}
				});
			}
		}
	}
	let he = (0, w.useCallback)((e) => {
		if (a || !C.current || e.target.closest("input,textarea,select,[contenteditable=\"true\"]") || !C.current.contains(document.activeElement) && document.activeElement !== document.body) return;
		let t = e.ctrlKey || e.metaKey, n = e.key.toLowerCase();
		if (t && n === "z" && !e.shiftKey) {
			e.preventDefault(), oe();
			return;
		}
		if (t && (n === "y" || n === "z" && e.shiftKey)) {
			e.preventDefault(), D();
			return;
		}
		if (t && n === "a") {
			e.preventDefault(), c(x.current.elements.map((e) => e.id));
			return;
		}
		if (!s.length) {
			t && n === "v" && b.current.length && ge();
			return;
		}
		if (n === "delete" || n === "backspace") {
			e.preventDefault(), E((e) => {
				e.elements = e.elements.filter((e) => !s.includes(e.id));
			}), c([]);
			return;
		}
		if (t && n === "c") {
			b.current = R(x.current.elements.filter((e) => s.includes(e.id)));
			return;
		}
		if (t && n === "x") {
			b.current = R(x.current.elements.filter((e) => s.includes(e.id))), E((e) => {
				e.elements = e.elements.filter((e) => !s.includes(e.id));
			}), c([]);
			return;
		}
		if (t && n === "v") {
			e.preventDefault(), ge();
			return;
		}
		if (t && n === "d") {
			e.preventDefault(), _e();
			return;
		}
		if (n === "escape") {
			c([]);
			return;
		}
		if (n === "enter" && k && k.type === "text") {
			e.preventDefault(), u(k.id);
			return;
		}
		let r = e.shiftKey ? 10 : 1, i = {
			arrowleft: [-r, 0],
			arrowright: [r, 0],
			arrowup: [0, -r],
			arrowdown: [0, r]
		};
		i[n] && (e.preventDefault(), E((e) => {
			for (let t of e.elements) s.includes(t.id) && (t.x += i[n][0], t.y += i[n][1]);
		}));
	}, [
		s,
		a,
		k
	]);
	(0, w.useEffect)(() => (addEventListener("keydown", he), () => removeEventListener("keydown", he)), [he]), (0, w.useEffect)(() => {
		let e = (e) => {
			if (a || e.target?.closest?.("input,textarea,[contenteditable=\"true\"]") || !C.current || !(C.current.contains(document.activeElement) || document.activeElement === document.body)) return;
			let t = [...e.clipboardData?.files || []].find((e) => /^image\//.test(e.type));
			t && (e.preventDefault(), j(t));
		};
		return addEventListener("paste", e), () => removeEventListener("paste", e);
	});
	function ge() {
		if (!b.current.length) return;
		let e = b.current.map((e) => ({
			...R(e),
			id: z(),
			x: e.x + 30,
			y: e.y + 30
		}));
		b.current = R(e), E((t) => {
			t.elements.push(...e);
		}), c(e.map((e) => e.id));
	}
	function _e() {
		let e = x.current.elements.filter((e) => s.includes(e.id)).map((e) => ({
			...R(e),
			id: z(),
			x: e.x + 30,
			y: e.y + 30
		}));
		E((t) => {
			t.elements.push(...e);
		}), c(e.map((e) => e.id));
	}
	let ve = (e) => E((t) => {
		let n = s;
		if (!n.length) return;
		if (e === "front" || e === "back") {
			let r = t.elements.filter((e) => n.includes(e.id)), i = t.elements.filter((e) => !n.includes(e.id));
			t.elements = e === "front" ? [...i, ...r] : [...r, ...i];
			return;
		}
		let r = t.elements;
		if (e === "up") for (let e = r.length - 2; e >= 0; e--) n.includes(r[e].id) && !n.includes(r[e + 1].id) && ([r[e], r[e + 1]] = [r[e + 1], r[e]]);
		else for (let e = 1; e < r.length; e++) n.includes(r[e].id) && !n.includes(r[e - 1].id) && ([r[e], r[e - 1]] = [r[e - 1], r[e]]);
	}), H = (e) => E((t) => {
		let n = t.elements.filter((e) => s.includes(e.id));
		if (!n.length) return;
		let r = n.length > 1 ? {
			x: Math.min(...n.map((e) => e.x)),
			y: Math.min(...n.map((e) => e.y)),
			r: Math.max(...n.map((e) => e.x + e.w)),
			b: Math.max(...n.map((e) => e.y + e.h))
		} : {
			x: 0,
			y: 0,
			r: I,
			b: L
		};
		for (let t of n) e === "left" && (t.x = r.x), e === "right" && (t.x = r.r - t.w), e === "center" && (t.x = Math.round((r.x + r.r - t.w) / 2)), e === "top" && (t.y = r.y), e === "bottom" && (t.y = r.b - t.h), e === "middle" && (t.y = Math.round((r.y + r.b - t.h) / 2));
	}), ye = n.DESIGN_FONTS, U = k && (k.type === "text" || k.type === "clock" || k.type === "table") ? k : null, W = O.length > 0;
	return /* @__PURE__ */ (0, T.jsxs)("div", {
		ref: C,
		tabIndex: -1,
		className: "grid min-w-0 gap-2 outline-none",
		children: [
			/* @__PURE__ */ (0, T.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1 rounded-xl border bg-card p-1.5 text-sm",
				children: [
					/* @__PURE__ */ (0, T.jsx)("span", {
						className: "px-1 text-xs font-semibold text-muted-foreground",
						children: "Insert"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Text",
						onClick: () => ce("text"),
						children: "𝐓 Text"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Title",
						onClick: () => ce("title"),
						children: "𝐇 Title"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Box",
						onClick: () => ce("rect"),
						children: "▭ Box"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Circle",
						onClick: () => ce("ellipse"),
						children: "◯"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Line",
						onClick: () => ce("line"),
						children: "━"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Picture",
						onClick: () => M("image/*", (e) => void j(e)),
						children: "🖼 Picture"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Video",
						onClick: () => M("video/mp4,video/webm", (e) => void j(e)),
						children: "🎬 Video"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Table",
						onClick: () => ce("table"),
						children: "▦ Table"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Clock (live time)",
						onClick: () => ce("clock"),
						children: "🕒 Clock"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Date (live)",
						onClick: () => ce("date"),
						children: "📅 Date"
					}),
					/* @__PURE__ */ (0, T.jsxs)("span", {
						className: "relative",
						children: [/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Emoji / icon",
							onClick: () => ne((e) => !e),
							children: "😀"
						}), te && /* @__PURE__ */ (0, T.jsx)("span", {
							className: "absolute left-0 top-9 z-30 grid w-72 grid-cols-9 gap-1 rounded-lg border bg-popover p-2 shadow-lg",
							children: de.map((e) => /* @__PURE__ */ (0, T.jsx)("button", {
								type: "button",
								className: "rounded p-1 text-xl hover:bg-accent",
								onClick: () => {
									ne(!1), se({
										type: "text",
										text: e,
										x: 440,
										y: 860,
										w: 200,
										h: 200,
										size: 140,
										align: "center",
										valign: "middle",
										pad: 0
									});
								},
								children: e
							}, e))
						})]
					}),
					/* @__PURE__ */ (0, T.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Undo (Ctrl+Z)",
						disabled: !v.current.length,
						onClick: oe,
						children: "↶"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Redo (Ctrl+Y)",
						disabled: !y.current.length,
						onClick: D,
						children: "↷"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Duplicate (Ctrl+D)",
						disabled: !W,
						onClick: _e,
						children: "⧉"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Delete (Del)",
						disabled: !W,
						onClick: () => {
							E((e) => {
								e.elements = e.elements.filter((e) => !s.includes(e.id));
							}), c([]);
						},
						children: "🗑"
					}),
					/* @__PURE__ */ (0, T.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Bring to front",
						disabled: !W,
						onClick: () => ve("front"),
						children: "⇈"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Forward",
						disabled: !W,
						onClick: () => ve("up"),
						children: "↑"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Backward",
						disabled: !W,
						onClick: () => ve("down"),
						children: "↓"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Send to back",
						disabled: !W,
						onClick: () => ve("back"),
						children: "⇊"
					}),
					/* @__PURE__ */ (0, T.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
					/* @__PURE__ */ (0, T.jsx)("span", {
						className: "px-1 text-xs font-semibold text-muted-foreground",
						children: O.length > 1 ? "Align together" : "Align on page"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Left",
						disabled: !W,
						onClick: () => H("left"),
						children: "⇤"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Centre",
						disabled: !W,
						onClick: () => H("center"),
						children: "↔"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Right",
						disabled: !W,
						onClick: () => H("right"),
						children: "⇥"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Top",
						disabled: !W,
						onClick: () => H("top"),
						children: "⤒"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Middle",
						disabled: !W,
						onClick: () => H("middle"),
						children: "↕"
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Bottom",
						disabled: !W,
						onClick: () => H("bottom"),
						children: "⤓"
					}),
					/* @__PURE__ */ (0, T.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
					/* @__PURE__ */ (0, T.jsx)("span", {
						className: "px-1 text-xs font-semibold text-muted-foreground",
						children: "Page"
					}),
					/* @__PURE__ */ (0, T.jsx)(V, {
						dis: a,
						title: "Background",
						value: o.bg,
						onPick: (e) => E((t) => {
							t.bg = e || "#ffffff";
						})
					}),
					/* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Background picture",
						onClick: () => M("image/*", async (e) => {
							_("Uploading…");
							try {
								let t = await i(e);
								E((e) => {
									e.bgImage = t;
								});
							} finally {
								_("");
							}
						}),
						children: "🖼 Bg"
					}),
					o.bgImage && /* @__PURE__ */ (0, T.jsx)(B, {
						dis: a,
						title: "Remove the background picture",
						onClick: () => E((e) => {
							e.bgImage = "";
						}),
						children: "✕ Bg"
					})
				]
			}),
			/* @__PURE__ */ (0, T.jsxs)("div", {
				className: "flex h-[6.2rem] flex-wrap content-start items-center gap-1 overflow-y-auto rounded-xl border bg-card p-1.5 text-sm",
				children: [
					"   ",
					!W && /* @__PURE__ */ (0, T.jsx)("span", {
						className: "px-2 text-xs text-muted-foreground",
						children: "Click an element to change it · double-click a text or a table cell to type · drop or paste a picture onto the page."
					}),
					U && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
						/* @__PURE__ */ (0, T.jsx)("select", {
							"aria-label": "Font",
							disabled: a,
							className: "h-8 max-w-40 rounded-md border bg-background px-1 text-sm",
							value: U.font || "Georgia",
							onChange: (e) => A({ font: e.target.value }),
							style: { fontFamily: U.font },
							children: ye.map((e) => /* @__PURE__ */ (0, T.jsx)("option", {
								value: e,
								style: { fontFamily: e },
								children: e
							}, e))
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Smaller",
							onClick: () => A({ size: Math.max(8, Math.round((U.size || 48) / 1.1)) }),
							children: "A−"
						}),
						/* @__PURE__ */ (0, T.jsx)("input", {
							"aria-label": "Text size",
							type: "number",
							min: 8,
							max: 400,
							disabled: a,
							className: "h-8 w-16 rounded-md border bg-background px-1 text-center",
							value: U.size || 48,
							onChange: (e) => A({ size: Math.max(8, Number(e.target.value) || 8) })
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Bigger",
							onClick: () => A({ size: Math.min(400, Math.round((U.size || 48) * 1.1)) }),
							children: "A+"
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Bold",
							on: !!U.bold,
							onClick: () => A({ bold: !U.bold }),
							children: /* @__PURE__ */ (0, T.jsx)("b", { children: "B" })
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Italic",
							on: !!U.italic,
							onClick: () => A({ italic: !U.italic }),
							children: /* @__PURE__ */ (0, T.jsx)("i", { children: "I" })
						}),
						U.type !== "table" && /* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Underline",
							on: !!U.underline,
							onClick: () => A({ underline: !U.underline }),
							children: /* @__PURE__ */ (0, T.jsx)("u", { children: "U" })
						}),
						/* @__PURE__ */ (0, T.jsx)(V, {
							dis: a,
							title: "Text",
							value: U.color,
							onPick: (e) => A({ color: e || "#111111" })
						}),
						U.type !== "table" && /* @__PURE__ */ (0, T.jsx)(V, {
							dis: a,
							title: "Fill",
							none: !0,
							value: U.bg,
							onPick: (e) => A({ bg: e })
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Align left",
							on: U.align === "left" || !U.align,
							onClick: () => A({ align: "left" }),
							children: "⯇"
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Centre",
							on: U.align === "center",
							onClick: () => A({ align: "center" }),
							children: "≡"
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Align right",
							on: U.align === "right",
							onClick: () => A({ align: "right" }),
							children: "⯈"
						}),
						U.type !== "table" && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
							/* @__PURE__ */ (0, T.jsx)(B, {
								dis: a,
								title: "Top",
								on: U.valign === "top",
								onClick: () => A({ valign: "top" }),
								children: "⤒"
							}),
							/* @__PURE__ */ (0, T.jsx)(B, {
								dis: a,
								title: "Middle",
								on: !U.valign || U.valign === "middle",
								onClick: () => A({ valign: "middle" }),
								children: "↕"
							}),
							/* @__PURE__ */ (0, T.jsx)(B, {
								dis: a,
								title: "Bottom",
								on: U.valign === "bottom",
								onClick: () => A({ valign: "bottom" }),
								children: "⤓"
							}),
							/* @__PURE__ */ (0, T.jsx)(B, {
								dis: a,
								title: "Shadow",
								on: !!U.shadow,
								onClick: () => A({ shadow: !U.shadow }),
								children: "S̈"
							}),
							/* @__PURE__ */ (0, T.jsxs)("label", {
								className: "flex items-center gap-1 text-xs",
								title: "Line spacing",
								children: ["↨", /* @__PURE__ */ (0, T.jsx)("input", {
									type: "number",
									step: .1,
									min: .8,
									max: 3,
									disabled: a,
									className: "h-8 w-14 rounded-md border bg-background px-1",
									value: U.lh ?? 1.2,
									onChange: (e) => A({ lh: Number(e.target.value) || 1.2 })
								})]
							})
						] }),
						U.type === "clock" && /* @__PURE__ */ (0, T.jsxs)("select", {
							"aria-label": "Clock shows",
							disabled: a,
							className: "h-8 rounded-md border bg-background px-1 text-sm",
							value: U.fmt || "time12",
							onChange: (e) => A({ fmt: e.target.value }),
							children: [
								/* @__PURE__ */ (0, T.jsx)("option", {
									value: "time12",
									children: "Time 4:35 PM"
								}),
								/* @__PURE__ */ (0, T.jsx)("option", {
									value: "time24",
									children: "Time 16:35"
								}),
								/* @__PURE__ */ (0, T.jsx)("option", {
									value: "day",
									children: "Day & date"
								}),
								/* @__PURE__ */ (0, T.jsx)("option", {
									value: "date",
									children: "Date"
								})
							]
						})
					] }),
					k?.type === "table" && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
						/* @__PURE__ */ (0, T.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "First row is a heading",
							on: k.head !== !1,
							onClick: () => A({ head: k.head === !1 }),
							children: "H"
						}),
						/* @__PURE__ */ (0, T.jsx)(V, {
							dis: a,
							title: "Heading",
							value: k.headBg,
							onPick: (e) => A({ headBg: e || "#1d4ed8" })
						}),
						/* @__PURE__ */ (0, T.jsx)(V, {
							dis: a,
							title: "Heading text",
							value: k.headColor,
							onPick: (e) => A({ headColor: e || "#ffffff" })
						}),
						/* @__PURE__ */ (0, T.jsx)(V, {
							dis: a,
							title: "Cells",
							value: k.cellBg,
							onPick: (e) => A({ cellBg: e || "#dbeafe" })
						}),
						/* @__PURE__ */ (0, T.jsx)(V, {
							dis: a,
							title: "Every 2nd",
							none: !0,
							value: k.altBg,
							onPick: (e) => A({ altBg: e })
						}),
						/* @__PURE__ */ (0, T.jsx)(V, {
							dis: a,
							title: "Lines",
							value: k.line,
							onPick: (e) => A({ line: e || "#ffffff" })
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Add a row",
							onClick: () => E((e) => {
								let t = e.elements.find((e) => e.id === k.id);
								t.cells.push(t.cells[0].map(() => "")), t.h += Math.round(t.h / Math.max(1, t.cells.length - 1));
							}),
							children: "＋ Row"
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Remove the last row",
							disabled: k.cells.length < 2,
							onClick: () => E((e) => {
								let t = e.elements.find((e) => e.id === k.id);
								t.h -= Math.round(t.h / t.cells.length), t.cells.pop();
							}),
							children: "− Row"
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Add a column",
							onClick: () => E((e) => {
								let t = e.elements.find((e) => e.id === k.id);
								t.cells.forEach((e, n) => e.push(n === 0 && t.head !== !1 ? "Heading" : ""));
							}),
							children: "＋ Col"
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Remove the last column",
							disabled: (k.cells[0] || []).length < 2,
							onClick: () => E((e) => {
								e.elements.find((e) => e.id === k.id).cells.forEach((e) => e.pop());
							}),
							children: "− Col"
						})
					] }),
					k?.type === "shape" && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
						/* @__PURE__ */ (0, T.jsx)(V, {
							dis: a,
							title: "Fill",
							none: !0,
							value: k.fill,
							onPick: (e) => A({ fill: e })
						}),
						/* @__PURE__ */ (0, T.jsx)(V, {
							dis: a,
							title: "Border",
							value: k.borderColor,
							onPick: (e) => A({
								borderColor: e || "#000000",
								border: k.border || 4
							})
						}),
						/* @__PURE__ */ (0, T.jsxs)("label", {
							className: "flex items-center gap-1 text-xs",
							children: ["Border", /* @__PURE__ */ (0, T.jsx)("input", {
								type: "number",
								min: 0,
								max: 80,
								disabled: a,
								className: "h-8 w-14 rounded-md border bg-background px-1",
								value: k.border || 0,
								onChange: (e) => A({ border: Number(e.target.value) || 0 })
							})]
						}),
						k.shape !== "ellipse" && /* @__PURE__ */ (0, T.jsxs)("label", {
							className: "flex items-center gap-1 text-xs",
							children: ["Corners", /* @__PURE__ */ (0, T.jsx)("input", {
								type: "number",
								min: 0,
								max: 2e3,
								disabled: a,
								className: "h-8 w-16 rounded-md border bg-background px-1",
								value: k.radius || 0,
								onChange: (e) => A({ radius: Number(e.target.value) || 0 })
							})]
						})
					] }),
					(k?.type === "image" || k?.type === "video") && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
						/* @__PURE__ */ (0, T.jsxs)("select", {
							"aria-label": "Fit",
							disabled: a,
							className: "h-8 rounded-md border bg-background px-1 text-sm",
							value: k.fit || "cover",
							onChange: (e) => A({ fit: e.target.value }),
							children: [
								/* @__PURE__ */ (0, T.jsx)("option", {
									value: "cover",
									children: "Fill the box"
								}),
								/* @__PURE__ */ (0, T.jsx)("option", {
									value: "contain",
									children: "Whole picture"
								}),
								k.type === "image" && /* @__PURE__ */ (0, T.jsx)("option", {
									value: "fill",
									children: "Stretch"
								})
							]
						}),
						/* @__PURE__ */ (0, T.jsxs)("label", {
							className: "flex items-center gap-1 text-xs",
							children: ["Corners", /* @__PURE__ */ (0, T.jsx)("input", {
								type: "number",
								min: 0,
								max: 2e3,
								disabled: a,
								className: "h-8 w-16 rounded-md border bg-background px-1",
								value: k.radius || 0,
								onChange: (e) => A({ radius: Number(e.target.value) || 0 })
							})]
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: "Replace (or double-click it)",
							onClick: () => M(k.type === "video" ? "video/mp4,video/webm" : "image/*", async (e) => {
								_("Replacing…");
								try {
									let t = await i(e);
									A({ src: t });
								} finally {
									_("");
								}
							}),
							children: "⟳ Replace"
						})
					] }),
					W && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
						/* @__PURE__ */ (0, T.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
						/* @__PURE__ */ (0, T.jsxs)("label", {
							className: "flex items-center gap-1 text-xs",
							title: "See-through",
							children: ["◐", /* @__PURE__ */ (0, T.jsx)("input", {
								type: "range",
								min: .1,
								max: 1,
								step: .05,
								disabled: a,
								value: O[0].opacity ?? 1,
								onChange: (e) => A({ opacity: Number(e.target.value) }),
								className: "w-20"
							})]
						}),
						k && /* @__PURE__ */ (0, T.jsxs)("label", {
							className: "flex items-center gap-1 text-xs",
							title: "Turn (degrees)",
							children: ["⟳", /* @__PURE__ */ (0, T.jsx)("input", {
								type: "number",
								min: -180,
								max: 180,
								disabled: a,
								className: "h-8 w-16 rounded-md border bg-background px-1",
								value: k.rot || 0,
								onChange: (e) => A({ rot: Number(e.target.value) || 0 })
							})]
						}),
						/* @__PURE__ */ (0, T.jsx)(B, {
							dis: a,
							title: O.every((e) => e.locked) ? "Unlock (can move again)" : "Lock in place",
							on: O.every((e) => e.locked),
							onClick: () => A({ locked: !O.every((e) => e.locked) }),
							children: O.every((e) => e.locked) ? "🔒" : "🔓"
						}),
						k && /* @__PURE__ */ (0, T.jsxs)("span", {
							className: "ml-auto font-mono text-[11px] text-muted-foreground",
							children: [
								"x ",
								k.x,
								" · y ",
								k.y,
								" · ",
								k.w,
								"×",
								k.h
							]
						})
					] })
				]
			}),
			/* @__PURE__ */ (0, T.jsx)("p", {
				className: "h-5 truncate text-sm text-muted-foreground",
				children: ee
			}),
			/* @__PURE__ */ (0, T.jsx)("div", {
				ref: re,
				className: "flex min-w-0 justify-center rounded-xl bg-[repeating-conic-gradient(#e5e7eb_0_25%,#f3f4f6_0_50%)] bg-[length:20px_20px] p-3",
				onDragOver: (e) => {
					!a && e.dataTransfer.types.includes("Files") && e.preventDefault();
				},
				onDrop: (e) => {
					if (a) return;
					e.preventDefault();
					let t = [...e.dataTransfer.files], n = S.current ? N(e.clientX, e.clientY) : void 0;
					t.forEach((e, t) => void j(e, n && {
						x: n.x + t * 40,
						y: n.y + t * 40
					}));
				},
				children: /* @__PURE__ */ (0, T.jsx)("div", {
					className: "relative shadow-xl",
					style: {
						width: I * h,
						height: L * h
					},
					children: /* @__PURE__ */ (0, T.jsxs)("div", {
						ref: S,
						className: "absolute left-0 top-0 origin-top-left select-none",
						style: {
							width: I,
							height: L,
							transform: `scale(${h})`,
							...ue(n.designBgCss(o, r)),
							overflow: "hidden"
						},
						onPointerDown: (e) => {
							e.target === S.current && (c([]), u(null), f(null), C.current?.focus({ preventScroll: !0 }));
						},
						children: [
							/* @__PURE__ */ (0, T.jsx)("span", {
								hidden: !0,
								dangerouslySetInnerHTML: { __html: n.designFonts(o) }
							}),
							o.elements.map((e) => /* @__PURE__ */ (0, T.jsx)("div", {
								style: {
									...ue(n.elBoxCss(e)),
									cursor: a ? "default" : e.locked ? "not-allowed" : l === e.id ? "text" : "move"
								},
								onPointerDown: (t) => {
									C.current?.focus({ preventScroll: !0 }), le(t, e);
								},
								onDoubleClick: (t) => me(t, e),
								children: l === e.id ? /* @__PURE__ */ (0, T.jsx)("div", {
									contentEditable: !0,
									suppressContentEditableWarning: !0,
									className: "min-h-[1em] w-full whitespace-pre-wrap outline-none",
									style: { cursor: "text" },
									ref: (e) => {
										if (e && document.activeElement !== e) {
											e.focus();
											let t = document.createRange();
											t.selectNodeContents(e);
											let n = getSelection();
											n?.removeAllRanges(), n?.addRange(t);
										}
									},
									onPointerDown: (e) => e.stopPropagation(),
									onBlur: (t) => {
										let n = t.currentTarget.innerText.replace(/\n$/, "");
										u(null), n !== e.text && E((t) => {
											t.elements.find((t) => t.id === e.id).text = n;
										});
									},
									onKeyDown: (e) => {
										e.key === "Escape" && e.currentTarget.blur();
									},
									children: e.text
								}) : /* @__PURE__ */ (0, T.jsx)("div", {
									style: { display: "contents" },
									dangerouslySetInnerHTML: { __html: n.elInner(e, r) }
								})
							}, e.id)),
							!a && O.map((e) => /* @__PURE__ */ (0, T.jsx)("div", {
								className: "pointer-events-none absolute",
								style: {
									left: e.x,
									top: e.y,
									width: e.w,
									height: e.h,
									transform: e.rot ? `rotate(${e.rot}deg)` : void 0,
									outline: `${2 / h}px solid #c9a227`,
									outlineOffset: 1 / h
								},
								children: k && !e.locked && l !== e.id && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [[
									"nw",
									"n",
									"ne",
									"e",
									"se",
									"s",
									"sw",
									"w"
								].map((t) => {
									let n = 12 / h, r = {
										left: t.includes("w") ? -n / 2 : t.includes("e") ? e.w - n / 2 : e.w / 2 - n / 2,
										top: t.includes("n") ? -n / 2 : t.includes("s") ? e.h - n / 2 : e.h / 2 - n / 2
									};
									return /* @__PURE__ */ (0, T.jsx)("span", {
										className: "pointer-events-auto absolute rounded-full border-white bg-[#c9a227] shadow",
										style: {
											...r,
											width: n,
											height: n,
											borderWidth: 2 / h,
											cursor: `${t}-resize`
										},
										onPointerDown: (n) => F(n, e, t)
									}, t);
								}), /* @__PURE__ */ (0, T.jsx)("span", {
									className: "pointer-events-auto absolute rounded-full border-white bg-white shadow",
									style: {
										left: e.w / 2 - 9 / h,
										top: -40 / h,
										width: 18 / h,
										height: 18 / h,
										border: `${3 / h}px solid #c9a227`,
										cursor: "grab"
									},
									title: "Turn",
									onPointerDown: (t) => fe(t, e)
								})] })
							}, "s" + e.id)),
							p.x.map((e, t) => /* @__PURE__ */ (0, T.jsx)("span", {
								className: "pointer-events-none absolute top-0 bg-fuchsia-500",
								style: {
									left: e,
									width: 2 / h,
									height: L
								}
							}, "gx" + t)),
							p.y.map((e, t) => /* @__PURE__ */ (0, T.jsx)("span", {
								className: "pointer-events-none absolute left-0 bg-fuchsia-500",
								style: {
									top: e,
									height: 2 / h,
									width: I
								}
							}, "gy" + t)),
							d && (() => {
								let e = o.elements.find((e) => e.id === d.id);
								return e ? /* @__PURE__ */ (0, T.jsx)("textarea", {
									autoFocus: !0,
									className: "absolute z-20 resize-none border-4 border-[#c9a227] bg-white p-1 text-black outline-none",
									style: {
										left: d.box[0],
										top: d.box[1],
										width: d.box[2],
										height: Math.max(d.box[3], 60),
										fontSize: e.size || 34,
										fontFamily: e.font
									},
									defaultValue: e.cells[d.r][d.c],
									onPointerDown: (e) => e.stopPropagation(),
									onKeyDown: (e) => {
										e.key === "Enter" && !e.shiftKey && (e.preventDefault(), e.currentTarget.blur()), e.key === "Escape" && f(null);
									},
									onBlur: (t) => {
										let n = t.currentTarget.value, { id: r, r: i, c: a } = d;
										f(null), n !== e.cells[i][a] && E((e) => {
											e.elements.find((e) => e.id === r).cells[i][a] = n;
										});
									}
								}) : null;
							})()
						]
					})
				})
			}),
			/* @__PURE__ */ (0, T.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Shift-click to pick several · Alt while dragging = no snapping · Shift while resizing a corner keeps the shape (pictures keep it by themselves) · Shift while turning = 15° steps · Ctrl+Z / Ctrl+Y · Ctrl+C / V / D · Del · arrows (Shift = 10 px)."
			})
		]
	});
}
// src/pages/signage-builder/ScreensPanel.tsx
var he = (e) => JSON.parse(JSON.stringify(e)), ge = {
	design: "🎨 Design",
	notice: "📋 Notice",
	image: "🖼️ Picture",
	video: "🎬 Video",
	pages: "📑 Pages"
}, _e = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
], ve = [
	["90", "TV turned anticlockwise (top edge on the left)"],
	["-90", "TV turned clockwise (top edge on the right)"],
	["0", "TV set to portrait itself"],
	["180", "Upside down"]
];
function H({ n: e }) {
	let { cloud: t } = r(), a = i(), o = n(), { siteId: p } = s(), { ask: h, dialog: g } = re(), ne = t.canWrite(p), S = !ne, [C, ie] = (0, w.useState)(null), [ae, E] = (0, w.useState)(null), [oe, A] = (0, w.useState)(0), [se, ce] = (0, w.useState)(""), [j, M] = (0, w.useState)(0), [N, P] = (0, w.useState)(""), [le, F] = (0, w.useState)({ t: "" }), [I, L] = (0, w.useState)(0), [R, z] = (0, w.useState)(!1), [ue, de] = (0, w.useState)(!1), fe = (0, w.useRef)(/* @__PURE__ */ new Set()), pe = !!ae && JSON.stringify(ae) !== se;
	(0, w.useEffect)(() => {
		Promise.all([a("screen"), a("screen-media")]).then(([e, t]) => ie({
			S: e,
			M: t
		}));
	}, []);
	async function B() {
		if (C) try {
			let t = await o(C.M.loadScreen(p, e)), n = t.config || C.S.defaultScreen(e);
			E(n), ce(JSON.stringify(n)), A(t.version || 0), M(0), F({ t: t.config ? `Saved ${t.updated_at ? new Date(t.updated_at).toLocaleString() : ""}${t.updated_by ? ` by ${t.updated_by}` : ""}` : "Not saved yet: the screen shows this default content." });
		} catch (e) {
			F({
				t: "Could not load: " + (e.message || e),
				bad: !0
			});
		}
	}
	if ((0, w.useEffect)(() => {
		B();
	}, [
		C,
		e,
		p
	]), !C || !ae) return /* @__PURE__ */ (0, T.jsxs)(y, {
		className: "p-4 text-sm text-muted-foreground",
		children: [
			"Loading screen ",
			e,
			"…"
		]
	});
	let { S: V, M: H } = C, W = (e) => String(e).startsWith("asset:") ? new URL("assets/" + String(e).slice(6), location.href).href : V.mediaUrl(t.apiBase(), e), G = ae.slides, K = G[j], q = (e) => E((t) => {
		let n = he(t);
		return e(n), n;
	}), be = (e, t) => q((n) => {
		n.slides[j][e] = t;
	}), xe = (e, t) => q((n) => {
		n.slides[j].sched = {
			...n.slides[j].sched || {},
			[e]: t
		};
	}), Se = (e, t) => q((n) => {
		n.slides[j].notice[e] = t;
	}), Ce = (e, t, n) => q((r) => {
		r.slides[j].notice.sections[e][t] = n;
	}), we = (e, t) => {
		let n = e + t;
		n < 0 || n >= G.length || (q((t) => {
			let [r] = t.slides.splice(e, 1);
			t.slides.splice(n, 0, r);
		}), M(n));
	};
	async function Te() {
		P("Saving…");
		try {
			let n = await o(H.saveScreen(p, e, ae, oe));
			E(n.config), ce(JSON.stringify(n.config)), A(n.version), F({ t: "Saved — the screen changes within a minute." });
			let r = JSON.stringify(n.config);
			for (let e of [...fe.current]) r.includes(`"${e}"`) || (fe.current.delete(e), t.request("DELETE", `/api/signage/media/${e}`).catch(() => {}));
		} catch (e) {
			F({
				t: e instanceof t.UserError ? e.message : "Could not save: " + (e.message || e),
				bad: !0
			});
		} finally {
			P("");
		}
	}
	async function Ee(e, t) {
		let n = [];
		for (let r = 0; r < e.length; r++) n.push(await H.uploadMedia(p, e[r], t, (n) => P(`Uploading ${t}${e.length > 1 ? ` — ${r + 1} of ${e.length}` : ""} · ${Math.round(n * 100)}%`)));
		return n.forEach((e) => fe.current.add(e)), n;
	}
	async function J(e) {
		for (let t of e) await De(t);
		e.length > 1 && F({ t: `Added ${e.length} files. Save to send them to the screen.` });
	}
	async function De(e) {
		if (!e) return;
		let n = H.kindOf(e), r = e.name.replace(/\.[^.]+$/, "");
		if (!n) F({
			t: "Pictures, videos (MP4, WebM), PDF and PowerPoint (.pptx) files only.",
			bad: !0
		});
		else if (n === "ppt") F({
			t: "An old PowerPoint (.ppt): open it in PowerPoint and save it as .pptx (or as PDF), then add that file.",
			bad: !0
		});
		else try {
			let t;
			t = n === "image" ? {
				kind: "image",
				media: await Ee([await H.prepImage(e)], r),
				seconds: 15
			} : n === "video" ? {
				kind: "video",
				media: await Ee([e], r),
				seconds: 0
			} : {
				kind: "pages",
				media: await Ee(n === "pdf" ? await H.pdfToImages(e, (e, t) => P(`Reading the PDF — page ${e} of ${t}`)) : await H.pptxToImages(e, (e, t) => P(`Drawing the PowerPoint — slide ${e} of ${t}`)), r),
				seconds: 12
			}, q((e) => {
				e.slides.push({
					id: V.newId(),
					name: r,
					on: !0,
					fit: "contain",
					bg: "#000000",
					sched: { on: !1 },
					...t
				});
			}), M(G.length), F({ t: `Added "${r}"${n === "pptx" ? " — check the pages in the preview: a slide with unusual effects can differ a little (a PDF saved from PowerPoint is exact)" : ""}. Save to send it to the screen.` });
		} catch (e) {
			F({
				t: e instanceof t.UserError ? e.message : "Could not add the file: " + (e.message || e),
				bad: !0
			});
		} finally {
			P("");
		}
	}
	async function Oe(e, t) {
		let n = document.createElement("input");
		n.type = "file", n.accept = e, n.onchange = async () => {
			let e = n.files?.[0];
			if (e) try {
				let [n] = await Ee([H.kindOf(e) === "image" ? await H.prepImage(e) : e], e.name);
				t(n);
			} catch (e) {
				F({
					t: "Could not upload: " + (e.message || e),
					bad: !0
				});
			} finally {
				P("");
			}
		}, n.click();
	}
	async function ke(n) {
		let r = e === 1 ? 2 : 1, i = G[n];
		if (await h({
			title: `Copy "${i.name}" to screen ${r}?`,
			body: `It is added at the end of screen ${r}'s slides and saved there now.`,
			confirmLabel: "Copy"
		})) {
			P(`Copying to screen ${r}…`);
			try {
				let t = await o(H.loadScreen(p, r)), n = t.config || V.defaultScreen(r);
				n.slides.push({
					...he(i),
					id: V.newId()
				}), await o(H.saveScreen(p, r, n, t.version || 0)), F({ t: `Copied "${i.name}" to screen ${r}.${pe ? " (Screen " + e + " still has unsaved changes.)" : ""}` });
			} catch (e) {
				F({
					t: e instanceof t.UserError ? e.message : "Could not copy: " + (e.message || e),
					bad: !0
				});
			} finally {
				P("");
			}
		}
	}
	async function Ae(e) {
		await h({
			title: `Remove "${G[e].name}"?`,
			body: "It leaves this screen when you save.",
			confirmLabel: "Remove"
		}) && (q((t) => {
			t.slides.splice(e, 1);
		}), M(Math.max(0, Math.min(j, G.length - 2))));
	}
	let Y = K?.sched || {};
	return /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
		/* @__PURE__ */ (0, T.jsxs)(y, {
			className: "flex-row flex-wrap items-end gap-3 p-3",
			children: [
				/* @__PURE__ */ (0, T.jsxs)("div", {
					className: "grid gap-1",
					children: [/* @__PURE__ */ (0, T.jsx)(m, {
						htmlFor: "scTurn",
						children: "Turn the picture"
					}), /* @__PURE__ */ (0, T.jsx)("select", {
						id: "scTurn",
						className: "h-9 rounded-md border bg-background px-2 text-sm",
						disabled: S,
						value: String(ae.rotate ?? 90),
						onChange: (e) => q((t) => {
							t.rotate = Number(e.target.value);
						}),
						children: ve.map(([e, t]) => /* @__PURE__ */ (0, T.jsx)("option", {
							value: e,
							children: t
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, T.jsxs)("div", {
					className: "grid gap-1",
					children: [/* @__PURE__ */ (0, T.jsx)(m, {
						htmlFor: "scFade",
						children: "Transition (s)"
					}), /* @__PURE__ */ (0, T.jsx)(b, {
						id: "scFade",
						className: "h-9 w-20",
						type: "number",
						min: 0,
						max: 3,
						step: .1,
						disabled: S,
						value: ae.fade ?? .6,
						onChange: (e) => q((t) => {
							t.fade = Number(e.target.value);
						})
					})]
				}),
				/* @__PURE__ */ (0, T.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						ne && /* @__PURE__ */ (0, T.jsxs)(v, {
							disabled: !pe || !!N,
							onClick: () => void Te(),
							children: ["Save screen ", e]
						}),
						pe && /* @__PURE__ */ (0, T.jsx)(v, {
							variant: "outline",
							disabled: !!N,
							onClick: () => void B(),
							children: "Discard changes"
						}),
						/* @__PURE__ */ (0, T.jsx)(v, {
							asChild: !0,
							variant: "outline",
							children: /* @__PURE__ */ (0, T.jsxs)("a", {
								href: `${p}/signage${e}`,
								target: "_blank",
								rel: "noopener",
								children: [
									"📺 Open screen ",
									e,
									" ↗"
								]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, T.jsx)("span", {
					className: x("text-sm", le.bad ? "text-destructive" : "text-muted-foreground"),
					role: "status",
					children: N || le.t
				})
			]
		}),
		/* @__PURE__ */ (0, T.jsxs)("div", {
			className: "grid gap-3 lg:grid-cols-[minmax(0,20rem)_auto_minmax(0,1fr)]",
			children: [
				/* @__PURE__ */ (0, T.jsxs)(y, {
					className: x("grid content-start gap-2 p-3", R && "ring-2 ring-gold"),
					onDragOver: (e) => {
						ne && e.dataTransfer.types.includes("Files") && (e.preventDefault(), z(!0));
					},
					onDragLeave: () => z(!1),
					onDrop: (e) => {
						ne && (e.preventDefault(), z(!1), J([...e.dataTransfer.files]));
					},
					children: [
						/* @__PURE__ */ (0, T.jsxs)("h2", {
							className: "font-bold",
							children: ["Slides of screen ", e]
						}),
						/* @__PURE__ */ (0, T.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Played top to bottom. A slide with a schedule shows only in its hours (Saudi time)."
						}),
						G.map((e, t) => /* @__PURE__ */ (0, T.jsxs)("div", {
							className: x("grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2", t === j && "border-gold bg-accent/50", e.on === !1 && "opacity-55"),
							onClick: () => M(t),
							children: [
								/* @__PURE__ */ (0, T.jsx)("input", {
									type: "checkbox",
									"aria-label": `Show ${e.name}`,
									title: "Shown on the screen",
									disabled: S,
									checked: e.on !== !1,
									onClick: (e) => e.stopPropagation(),
									onChange: (e) => q((n) => {
										n.slides[t].on = e.target.checked;
									})
								}),
								/* @__PURE__ */ (0, T.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, T.jsx)("b", {
										className: "block truncate text-sm",
										children: e.name
									}), /* @__PURE__ */ (0, T.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: [
											ge[e.kind],
											e.kind === "pages" ? ` · ${e.media.length}` : "",
											" · ",
											e.kind === "video" ? "to its end" : `${e.seconds}s${e.kind === "pages" ? " each" : ""}`,
											" · ",
											V.schedLabel(e.sched)
										]
									})]
								}),
								/* @__PURE__ */ (0, T.jsxs)("span", {
									className: "flex",
									children: [
										/* @__PURE__ */ (0, T.jsx)(v, {
											variant: "ghost",
											size: "icon",
											className: "size-7",
											"aria-label": "Up",
											disabled: S || t === 0,
											onClick: (e) => {
												e.stopPropagation(), we(t, -1);
											},
											children: /* @__PURE__ */ (0, T.jsx)(_, { className: "size-4" })
										}),
										/* @__PURE__ */ (0, T.jsx)(v, {
											variant: "ghost",
											size: "icon",
											className: "size-7",
											"aria-label": "Down",
											disabled: S || t === G.length - 1,
											onClick: (e) => {
												e.stopPropagation(), we(t, 1);
											},
											children: /* @__PURE__ */ (0, T.jsx)(ee, { className: "size-4" })
										}),
										/* @__PURE__ */ (0, T.jsx)(v, {
											variant: "ghost",
											size: "icon",
											className: "size-7 text-destructive",
											"aria-label": `Remove ${e.name}`,
											disabled: S,
											onClick: (e) => {
												e.stopPropagation(), Ae(t);
											},
											children: /* @__PURE__ */ (0, T.jsx)(te, { className: "size-4" })
										})
									]
								})
							]
						}, e.id)),
						!G.length && /* @__PURE__ */ (0, T.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No slides: the screen stays black."
						}),
						ne && /* @__PURE__ */ (0, T.jsxs)("div", {
							className: "grid gap-2 pt-1",
							children: [
								/* @__PURE__ */ (0, T.jsxs)("label", {
									className: x("inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border bg-background px-3 py-2 text-sm font-semibold hover:border-gold", N && "pointer-events-none opacity-50"),
									children: ["＋ Add picture, video, PDF or PowerPoint", /* @__PURE__ */ (0, T.jsx)("input", {
										type: "file",
										multiple: !0,
										className: "sr-only",
										accept: "image/*,video/mp4,video/webm,.mp4,.webm,application/pdf,.pdf,.pptx,.ppt",
										onChange: (e) => {
											let t = [...e.target.files || []];
											e.target.value = "", J(t);
										}
									})]
								}),
								/* @__PURE__ */ (0, T.jsx)("p", {
									className: "text-center text-[11px] text-muted-foreground",
									children: "Pick several files at once, or drop them on this list."
								}),
								/* @__PURE__ */ (0, T.jsx)(v, {
									disabled: !!N,
									onClick: () => de(!0),
									children: "🎨 ＋ Design slide (free, like PowerPoint)"
								}),
								/* @__PURE__ */ (0, T.jsx)(v, {
									variant: "outline",
									disabled: !!N,
									onClick: () => {
										q((t) => {
											t.slides.push({
												...he(V.defaultScreen(e).slides[0]),
												id: V.newId(),
												name: "Notice"
											});
										}), M(G.length);
									},
									children: "＋ Notice poster"
								})
							]
						})
					]
				}),
				K?.kind === "design" ? /* @__PURE__ */ (0, T.jsxs)(y, {
					className: "min-w-0 gap-2 p-3 lg:col-span-2",
					children: [/* @__PURE__ */ (0, T.jsxs)("h2", {
						className: "font-bold",
						children: [
							"🎨 ",
							K.name,
							" ",
							/* @__PURE__ */ (0, T.jsxs)("small", {
								className: "font-normal text-muted-foreground",
								children: [
									"— design it right on the page; Save screen ",
									e,
									" sends it to the TV"
								]
							})
						]
					}), /* @__PURE__ */ (0, T.jsx)(me, {
						design: K.design || V.newDesign(),
						S: V,
						url: W,
						dis: S,
						onChange: (e) => q((t) => {
							t.slides[j].design = e;
						}),
						uploadFile: async (e) => {
							let [t] = await Ee([H.kindOf(e) === "image" ? await H.prepImage(e) : e], e.name);
							return P(""), t;
						}
					}, K.id)]
				}) : /* @__PURE__ */ (0, T.jsxs)(y, {
					className: "grid content-start justify-items-center gap-2 p-3",
					children: [
						/* @__PURE__ */ (0, T.jsx)("h2", {
							className: "justify-self-start font-bold",
							children: "Preview"
						}),
						K ? /* @__PURE__ */ (0, T.jsx)(U, {
							slide: K,
							S: V,
							url: W
						}) : /* @__PURE__ */ (0, T.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Add a slide."
						}),
						K?.kind === "notice" && ne && /* @__PURE__ */ (0, T.jsx)(v, {
							variant: "outline",
							size: "sm",
							disabled: !!N,
							onClick: () => {
								let e = V.noticeToDesign(K.notice);
								q((t) => {
									t.slides[j].on = !1, t.slides.splice(j + 1, 0, {
										id: V.newId(),
										kind: "design",
										name: `${K.name} (design)`,
										on: !0,
										seconds: K.seconds || 30,
										fit: "contain",
										bg: "#000000",
										media: [],
										sched: he(K.sched || { on: !1 }),
										design: e
									});
								}), M(j + 1), F({ t: "Made a free design from this notice (the notice itself is switched off). Change anything on the page, then save." });
							},
							children: "🎨 Turn into a free design"
						}),
						K?.kind === "pages" && /* @__PURE__ */ (0, T.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [K.media.length, " pages — the first is shown; the screen shows each in turn."]
						})
					]
				}),
				K && /* @__PURE__ */ (0, T.jsxs)(y, {
					className: x("grid content-start gap-2 p-3 lg:max-h-[calc(100vh-140px)] lg:overflow-auto", K.kind === "design" && "lg:col-span-3 lg:max-h-none"),
					children: [
						/* @__PURE__ */ (0, T.jsx)("h2", {
							className: "font-bold",
							children: ge[K.kind]
						}),
						/* @__PURE__ */ (0, T.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Name", /* @__PURE__ */ (0, T.jsx)(b, {
								className: "h-8",
								disabled: S,
								value: K.name,
								onChange: (e) => be("name", e.target.value)
							})]
						}),
						ne && /* @__PURE__ */ (0, T.jsxs)(v, {
							size: "sm",
							variant: "outline",
							className: "w-fit",
							disabled: !!N,
							onClick: () => void ke(j),
							children: ["⧉ Copy to screen ", e === 1 ? 2 : 1]
						}),
						K.kind !== "video" && /* @__PURE__ */ (0, T.jsx)(D, {
							label: K.kind === "pages" ? "Seconds a page" : "Seconds",
							min: 3,
							max: 600,
							disabled: S,
							value: K.seconds,
							onChange: (e) => be("seconds", Math.max(3, Number(e) || 10))
						}),
						K.kind !== "notice" && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [/* @__PURE__ */ (0, T.jsx)(O, {
							label: "Fit",
							disabled: S,
							value: K.fit,
							list: [["contain", "Whole picture (bars around)"], ["cover", "Fill the screen (edges cut)"]],
							onChange: (e) => be("fit", e)
						}), /* @__PURE__ */ (0, T.jsx)(D, {
							label: "Bars colour",
							as: "color",
							disabled: S,
							value: K.bg,
							onChange: (e) => be("bg", e)
						})] }),
						/* @__PURE__ */ (0, T.jsxs)("div", {
							className: "mt-1 grid gap-2 rounded-lg border p-2",
							children: [/* @__PURE__ */ (0, T.jsx)(k, {
								label: "Show only at certain times",
								disabled: S,
								value: Y.on,
								onChange: (e) => xe("on", e)
							}), Y.on && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
								/* @__PURE__ */ (0, T.jsx)("div", {
									className: "flex flex-wrap gap-1",
									children: _e.map((e, t) => {
										let n = !Y.days?.length || Y.days.includes(t);
										return /* @__PURE__ */ (0, T.jsx)("button", {
											type: "button",
											disabled: S,
											className: x("rounded border px-2 py-0.5 text-xs", n ? "border-gold bg-accent font-bold" : "text-muted-foreground"),
											onClick: () => {
												let e = Y.days?.length ? Y.days : [
													0,
													1,
													2,
													3,
													4,
													5,
													6
												];
												xe("days", n ? e.filter((e) => e !== t) : [...e, t].sort());
											},
											children: e
										}, e);
									})
								}),
								/* @__PURE__ */ (0, T.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [
										/* @__PURE__ */ (0, T.jsxs)("label", {
											className: "grid gap-1 text-xs font-semibold",
											children: ["From", /* @__PURE__ */ (0, T.jsx)(b, {
												type: "time",
												className: "h-8",
												disabled: S,
												value: Y.from || "00:00",
												onChange: (e) => xe("from", e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, T.jsxs)("label", {
											className: "grid gap-1 text-xs font-semibold",
											children: ["To", /* @__PURE__ */ (0, T.jsx)(b, {
												type: "time",
												className: "h-8",
												disabled: S,
												value: Y.to || "23:59",
												onChange: (e) => xe("to", e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, T.jsxs)("label", {
											className: "grid gap-1 text-xs font-semibold",
											children: ["First date", /* @__PURE__ */ (0, T.jsx)(b, {
												type: "date",
												className: "h-8",
												disabled: S,
												value: Y.dateFrom || "",
												onChange: (e) => xe("dateFrom", e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, T.jsxs)("label", {
											className: "grid gap-1 text-xs font-semibold",
											children: ["Last date", /* @__PURE__ */ (0, T.jsx)(b, {
												type: "date",
												className: "h-8",
												disabled: S,
												value: Y.dateTo || "",
												onChange: (e) => xe("dateTo", e.target.value)
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, T.jsx)(k, {
									label: "Only this while it is on (the other slides pause)",
									disabled: S,
									value: Y.only,
									onChange: (e) => xe("only", e)
								}),
								/* @__PURE__ */ (0, T.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: ["Saudi time. From 22:00 to 02:00 runs past midnight. ", V.schedLabel(Y)]
								})
							] })]
						}),
						K.kind === "notice" && /* @__PURE__ */ (0, T.jsx)(ye, {
							nt: K.notice,
							dis: S,
							busy: !!N,
							open: I,
							setOpen: L,
							setNotice: Se,
							setSec: Ce,
							S: V,
							set: (e) => q((t) => e(t.slides[j].notice)),
							pick: (e, t) => Oe(t, (t) => Se(e, t)),
							pickSec: (e) => Oe("image/*", (t) => Ce(e, "image", t))
						})
					]
				})
			]
		}),
		g,
		/* @__PURE__ */ (0, T.jsx)(f, {
			open: ue,
			onOpenChange: de,
			children: /* @__PURE__ */ (0, T.jsxs)(l, {
				className: "flex max-h-[90vh] max-w-5xl flex-col",
				children: [/* @__PURE__ */ (0, T.jsxs)(c, { children: [/* @__PURE__ */ (0, T.jsx)(u, {
					className: "font-serif text-2xl",
					children: "🎨 Pick a design to start from"
				}), /* @__PURE__ */ (0, T.jsx)(d, { children: "Everything on it can then be moved, resized and changed on the page." })] }), /* @__PURE__ */ (0, T.jsx)("div", {
					className: "grid min-h-0 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 overflow-y-auto p-1",
					children: V.DESIGN_PRESETS.map((e) => {
						let t = e.make();
						return /* @__PURE__ */ (0, T.jsxs)("button", {
							type: "button",
							className: "grid gap-1.5 rounded-xl border bg-card p-2 text-left transition hover:-translate-y-0.5 hover:border-gold hover:shadow-md",
							onClick: () => {
								let t = e.make();
								q((n) => {
									n.slides.push({
										id: V.newId(),
										kind: "design",
										name: e.name,
										on: !0,
										seconds: 20,
										fit: "contain",
										bg: "#000000",
										media: [],
										sched: { on: !1 },
										design: t
									});
								}), M(G.length), de(!1), F({ t: `Added "${e.name}" — change anything right on the page, then save.` });
							},
							children: [/* @__PURE__ */ (0, T.jsx)("span", {
								className: "relative mx-auto block overflow-hidden rounded-md border",
								style: {
									width: 130,
									height: 2080 / 9
								},
								children: /* @__PURE__ */ (0, T.jsx)("span", {
									className: "absolute left-0 top-0 block origin-top-left",
									style: {
										width: V.STAGE_W,
										height: V.STAGE_H,
										transform: `scale(${130 / V.STAGE_W})`
									},
									dangerouslySetInnerHTML: { __html: V.designHtml(t, W) }
								})
							}), /* @__PURE__ */ (0, T.jsx)("b", {
								className: "text-sm",
								children: e.name
							})]
						}, e.id);
					})
				})]
			})
		})
	] });
}
function ye({ nt: e, dis: t, busy: n, open: r, setOpen: i, setNotice: a, setSec: o, set: s, pick: c, pickSec: l, S: u }) {
	let d = e.sections || [];
	return /* @__PURE__ */ (0, T.jsxs)("div", {
		className: "grid gap-2",
		children: [
			/* @__PURE__ */ (0, T.jsxs)("div", {
				className: "grid gap-1 text-xs font-semibold",
				children: ["Design", /* @__PURE__ */ (0, T.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: Object.entries(u.DESIGNS).map(([n, r]) => /* @__PURE__ */ (0, T.jsxs)("button", {
						type: "button",
						disabled: t,
						title: `Colours of the "${r.label}" design (text, tables and pictures stay)`,
						onClick: () => s((e) => {
							u.applyDesign(e, n);
						}),
						className: x("flex items-center gap-1.5 rounded-lg border px-2 py-1 font-normal", e.design === n && "border-gold bg-accent font-bold"),
						children: [/* @__PURE__ */ (0, T.jsxs)("span", {
							className: "flex",
							children: [
								/* @__PURE__ */ (0, T.jsx)("i", {
									className: "size-3.5 rounded-l",
									style: { background: r.strip }
								}),
								/* @__PURE__ */ (0, T.jsx)("i", {
									className: "size-3.5",
									style: { background: r.bg }
								}),
								/* @__PURE__ */ (0, T.jsx)("i", {
									className: "size-3.5 rounded-r",
									style: { background: r.tdBg }
								})
							]
						}), r.label]
					}, n))
				})]
			}),
			/* @__PURE__ */ (0, T.jsxs)("label", {
				className: "grid gap-1 text-xs font-semibold",
				children: ["Side title", /* @__PURE__ */ (0, T.jsx)(b, {
					className: "h-8",
					disabled: t,
					value: e.title,
					onChange: (e) => a("title", e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, T.jsx)(O, {
				label: "Side strip",
				disabled: t,
				value: e.side,
				list: [["left", "On the left"], ["right", "On the right"]],
				onChange: (e) => a("side", e)
			}),
			/* @__PURE__ */ (0, T.jsx)(O, {
				label: "Strip size",
				disabled: t,
				value: e.stripSize || "normal",
				list: [
					["hidden", "Hidden (no strip)"],
					["slim", "Slim"],
					["normal", "Normal"],
					["wide", "Wide"]
				],
				onChange: (e) => a("stripSize", e)
			}),
			(e.stripSize || "normal") !== "hidden" && /* @__PURE__ */ (0, T.jsx)(D, {
				label: "Title size",
				min: 30,
				max: 220,
				disabled: t,
				value: e.titleSize ?? null,
				onChange: (e) => a("titleSize", e)
			}),
			/* @__PURE__ */ (0, T.jsx)(O, {
				label: "Heading font",
				disabled: t,
				value: e.headFont || "",
				list: [["", "Same as text"], ...u.NOTICE_FONTS.map((e) => [e, e])],
				onChange: (e) => a("headFont", e)
			}),
			/* @__PURE__ */ (0, T.jsx)(O, {
				label: "Text font",
				disabled: t,
				value: e.bodyFont || "Georgia",
				list: u.NOTICE_FONTS.map((e) => [e, e]),
				onChange: (e) => a("bodyFont", e)
			}),
			/* @__PURE__ */ (0, T.jsxs)("div", {
				className: "grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-1.5 text-xs font-semibold",
				children: ["Text size", /* @__PURE__ */ (0, T.jsxs)("span", {
					className: "flex items-center gap-2 font-normal",
					children: [/* @__PURE__ */ (0, T.jsxs)("label", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, T.jsx)("input", {
							type: "checkbox",
							disabled: t,
							checked: !e.textSize,
							onChange: (e) => a("textSize", e.target.checked ? null : 34)
						}), "Auto (fill the screen)"]
					}), !!e.textSize && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [/* @__PURE__ */ (0, T.jsx)("input", {
						type: "range",
						min: 16,
						max: 80,
						disabled: t,
						value: e.textSize,
						onChange: (e) => a("textSize", Number(e.target.value)),
						className: "min-w-0 flex-1"
					}), /* @__PURE__ */ (0, T.jsxs)("b", {
						className: "w-10 text-right",
						children: [e.textSize, "px"]
					})] })]
				})]
			}),
			!!e.textSize && /* @__PURE__ */ (0, T.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: "With a fixed size, long text can run past the bottom of the screen — check the preview."
			}),
			/* @__PURE__ */ (0, T.jsx)(D, {
				label: "Strip colour",
				as: "color",
				disabled: t,
				value: e.strip,
				onChange: (e) => a("strip", e)
			}),
			/* @__PURE__ */ (0, T.jsx)(D, {
				label: "Text colour",
				as: "color",
				disabled: t,
				value: e.color,
				onChange: (e) => a("color", e)
			}),
			/* @__PURE__ */ (0, T.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 text-xs",
				children: [
					/* @__PURE__ */ (0, T.jsx)("b", { children: "Background:" }),
					/* @__PURE__ */ (0, T.jsx)("span", {
						className: "text-muted-foreground",
						children: e.bgVideo ? String(e.bgVideo).startsWith("asset:") ? "bubbles video" : "own video" : e.bgImage ? "picture" : "colour"
					}),
					/* @__PURE__ */ (0, T.jsx)(v, {
						size: "sm",
						variant: "outline",
						className: "h-7",
						disabled: t || n,
						onClick: () => c("bgImage", "image/*"),
						children: "Picture…"
					}),
					/* @__PURE__ */ (0, T.jsx)(v, {
						size: "sm",
						variant: "outline",
						className: "h-7",
						disabled: t || n,
						onClick: () => c("bgVideo", "video/mp4,video/webm"),
						children: "Video…"
					}),
					/* @__PURE__ */ (0, T.jsx)(v, {
						size: "sm",
						variant: "outline",
						className: "h-7",
						disabled: t,
						onClick: () => s((e) => {
							e.bgVideo = "asset:signage/notice-bg.mp4", e.bgImage = "asset:signage/notice-bg.jpg";
						}),
						children: "Bubbles"
					}),
					/* @__PURE__ */ (0, T.jsx)(v, {
						size: "sm",
						variant: "outline",
						className: "h-7",
						disabled: t,
						onClick: () => s((e) => {
							e.bgVideo = "", e.bgImage = "";
						}),
						children: "Colour only"
					})
				]
			}),
			!e.bgVideo && !e.bgImage && /* @__PURE__ */ (0, T.jsx)(D, {
				label: "Colour",
				as: "color",
				disabled: t,
				value: e.bg || "#dcebfb",
				onChange: (e) => a("bg", e)
			}),
			/* @__PURE__ */ (0, T.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "In the text: **bold**, !!red!!, __underline__. Table: one row a line, cells split by |; a line starting with # is a heading row; ^ joins a cell with the one above."
			}),
			d.map((e, a) => /* @__PURE__ */ (0, T.jsxs)("div", {
				className: "grid gap-1.5 rounded-lg border p-2",
				children: [/* @__PURE__ */ (0, T.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, T.jsxs)("button", {
							type: "button",
							className: "min-w-0 flex-1 truncate text-left text-sm font-bold",
							onClick: () => i(r === a ? null : a),
							children: [
								r === a ? "▾" : "▸",
								" ",
								e.icon,
								" ",
								e.title
							]
						}),
						/* @__PURE__ */ (0, T.jsx)(v, {
							variant: "ghost",
							size: "icon",
							className: "size-7",
							"aria-label": "Section up",
							disabled: t || a === 0,
							onClick: () => s((e) => {
								let [t] = e.sections.splice(a, 1);
								e.sections.splice(a - 1, 0, t);
							}),
							children: /* @__PURE__ */ (0, T.jsx)(_, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, T.jsx)(v, {
							variant: "ghost",
							size: "icon",
							className: "size-7",
							"aria-label": "Section down",
							disabled: t || a === d.length - 1,
							onClick: () => s((e) => {
								let [t] = e.sections.splice(a, 1);
								e.sections.splice(a + 1, 0, t);
							}),
							children: /* @__PURE__ */ (0, T.jsx)(ee, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, T.jsx)(v, {
							variant: "ghost",
							size: "icon",
							className: "size-7 text-destructive",
							"aria-label": "Remove section",
							disabled: t,
							onClick: () => s((e) => {
								e.sections.splice(a, 1);
							}),
							children: /* @__PURE__ */ (0, T.jsx)(te, { className: "size-4" })
						})
					]
				}), r === a && /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
					/* @__PURE__ */ (0, T.jsxs)("div", {
						className: "grid grid-cols-[3.5rem_minmax(0,1fr)] gap-1.5",
						children: [/* @__PURE__ */ (0, T.jsx)(b, {
							className: "h-8 text-center",
							"aria-label": "Icon",
							disabled: t,
							value: e.icon,
							onChange: (e) => o(a, "icon", e.target.value)
						}), /* @__PURE__ */ (0, T.jsx)(b, {
							className: "h-8",
							"aria-label": "Heading",
							disabled: t,
							value: e.title,
							onChange: (e) => o(a, "title", e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, T.jsx)(D, {
						label: "Band colour",
						as: "color",
						disabled: t,
						value: e.band,
						onChange: (e) => o(a, "band", e)
					}),
					/* @__PURE__ */ (0, T.jsx)(A, {
						label: "Text",
						disabled: t,
						value: e.text,
						onChange: (e) => o(a, "text", e)
					}),
					/* @__PURE__ */ (0, T.jsx)(O, {
						label: "Text align",
						disabled: t,
						value: e.align,
						list: [["left", "Left"], ["center", "Centre"]],
						onChange: (e) => o(a, "align", e)
					}),
					/* @__PURE__ */ (0, T.jsxs)("div", {
						className: "grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-1.5 text-xs font-semibold",
						children: ["Section size", /* @__PURE__ */ (0, T.jsxs)("span", {
							className: "flex items-center gap-2 font-normal",
							children: [/* @__PURE__ */ (0, T.jsx)("input", {
								type: "range",
								min: 60,
								max: 160,
								step: 5,
								disabled: t,
								value: e.scale || 100,
								onChange: (e) => o(a, "scale", Number(e.target.value)),
								className: "min-w-0 flex-1"
							}), /* @__PURE__ */ (0, T.jsxs)("b", {
								className: "w-10 text-right",
								children: [e.scale || 100, "%"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, T.jsx)(F, {
						value: e.table || "",
						disabled: t,
						onChange: (e) => o(a, "table", e)
					}),
					/* @__PURE__ */ (0, T.jsx)(A, {
						label: "Line under the table (optional)",
						disabled: t,
						value: e.note,
						onChange: (e) => o(a, "note", e)
					}),
					/* @__PURE__ */ (0, T.jsxs)("div", {
						className: "flex items-center gap-2 text-xs",
						children: [
							/* @__PURE__ */ (0, T.jsx)("b", { children: "Picture (QR code…):" }),
							e.image ? /* @__PURE__ */ (0, T.jsx)("span", {
								className: "text-muted-foreground",
								children: "set"
							}) : /* @__PURE__ */ (0, T.jsx)("span", {
								className: "text-muted-foreground",
								children: "none"
							}),
							/* @__PURE__ */ (0, T.jsx)(v, {
								size: "sm",
								variant: "outline",
								className: "h-7",
								disabled: t || n,
								onClick: () => l(a),
								children: e.image ? "Change…" : "Add…"
							}),
							e.image && /* @__PURE__ */ (0, T.jsx)(v, {
								size: "sm",
								variant: "ghost",
								className: "h-7 text-destructive",
								disabled: t,
								onClick: () => o(a, "image", ""),
								children: "Remove"
							})
						]
					})
				] })]
			}, a)),
			!t && /* @__PURE__ */ (0, T.jsx)(v, {
				variant: "outline",
				size: "sm",
				onClick: () => {
					s((e) => {
						e.sections.push(u.blankSection());
					}), i(d.length);
				},
				children: "＋ Section"
			})
		]
	});
}
function U({ slide: e, S: t, url: n }) {
	let r = 300 / t.STAGE_W, i = (0, w.useRef)(null), a = e.kind === "notice" ? t.noticeHtml(e.notice, n) : "";
	(0, w.useLayoutEffect)(() => {
		i.current && e.kind === "notice" && t.fitNotice(i.current);
	}, [a]);
	let o = e.media?.[0], [s, c] = (0, w.useState)("");
	return (0, w.useEffect)(() => {
		c(o && e.kind !== "notice" ? "loading" : "");
	}, [o, e.kind]), /* @__PURE__ */ (0, T.jsxs)("div", {
		className: "relative overflow-hidden rounded-md border bg-black shadow",
		style: {
			width: 300,
			height: t.STAGE_H * r
		},
		children: [
			e.kind === "notice" ? /* @__PURE__ */ (0, T.jsx)("div", {
				ref: i,
				className: "absolute left-0 top-0 origin-top-left",
				style: {
					width: t.STAGE_W,
					height: t.STAGE_H,
					transform: `scale(${r})`
				},
				dangerouslySetInnerHTML: { __html: a }
			}) : /* @__PURE__ */ (0, T.jsxs)("div", {
				className: "absolute left-0 top-0 origin-top-left",
				style: {
					width: t.STAGE_W,
					height: t.STAGE_H,
					transform: `scale(${r})`,
					background: e.bg || "#000"
				},
				children: [e.kind === "video" && o && /* @__PURE__ */ (0, T.jsx)("video", {
					src: n(o),
					onLoadedData: () => c("ok"),
					onError: () => c("failed"),
					muted: !0,
					autoPlay: !0,
					loop: !0,
					playsInline: !0,
					className: "absolute inset-0 size-full",
					style: { objectFit: e.fit === "cover" ? "cover" : "contain" }
				}, o), (e.kind === "image" || e.kind === "pages") && o && /* @__PURE__ */ (0, T.jsx)("img", {
					src: n(o),
					onLoad: () => c("ok"),
					onError: () => c("failed"),
					alt: "",
					className: "absolute inset-0 size-full",
					style: { objectFit: e.fit === "cover" ? "cover" : "contain" }
				}, o)]
			}),
			e.kind !== "notice" && !o && /* @__PURE__ */ (0, T.jsx)(S, {
				className: "absolute left-2 top-2",
				children: "No file"
			}),
			s === "loading" && /* @__PURE__ */ (0, T.jsxs)("span", {
				className: "absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-white/80",
				children: [
					"Loading ",
					e.kind === "video" ? "video" : "picture",
					"…"
				]
			}),
			s === "failed" && /* @__PURE__ */ (0, T.jsx)("span", {
				className: "absolute inset-x-3 top-1/2 -translate-y-1/2 rounded bg-destructive/90 p-2 text-center text-sm text-white",
				children: "This file could not be loaded. Check the connection, or add the file again."
			})
		]
	});
}
// src/pages/signage-builder/DataSource.tsx
var W = { makkah: "https://sigatulhaj.org/signage/testsignage.aspx" }, G = (e) => new Date(e).toLocaleString("en-GB", {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit"
});
function K({ cfg: e, siteId: t, writable: n, cloud: r, save: i, onRoutes: a }) {
	let [o, s] = (0, w.useState)(e.source || "pms"), [c, l] = (0, w.useState)(e.sh_url || W[t] || ""), [u, d] = (0, w.useState)(null), [f, p] = (0, w.useState)(!1), [m, h] = (0, w.useState)("");
	(0, w.useEffect)(() => {
		s(e.source || "pms"), l(e.sh_url || W[t] || "");
	}, [
		e.source,
		e.sh_url,
		t
	]);
	let g = o !== (e.source || "pms") || c !== (e.sh_url || W[t] || "");
	async function ee() {
		p(!0), h("");
		try {
			let e = await r.request("GET", `/api/signage/sigatul?site=${t}&url=${encodeURIComponent(c)}`);
			d(e), e.ok && a([...new Set(e.rows.map((e) => e.route))]);
		} catch (e) {
			d({
				ok: !1,
				error: e.message
			});
		} finally {
			p(!1);
		}
	}
	(0, w.useEffect)(() => {
		(e.source || "pms") === "sigatulhaj" && ee();
	}, [e.source]);
	let _ = (e, t, r) => /* @__PURE__ */ (0, T.jsxs)("button", {
		type: "button",
		role: "radio",
		"aria-checked": o === e,
		disabled: !n,
		onClick: () => s(e),
		className: x("grid flex-1 gap-0.5 rounded-xl border-2 p-3 text-left transition", o === e ? "border-gold bg-accent" : "border-transparent bg-muted/50 hover:border-muted-foreground/30"),
		children: [/* @__PURE__ */ (0, T.jsxs)("b", {
			className: "flex items-center gap-2",
			children: [
				o === e ? "🔘" : "⚪",
				" ",
				t
			]
		}), /* @__PURE__ */ (0, T.jsx)("small", {
			className: "text-muted-foreground",
			children: r
		})]
	});
	return /* @__PURE__ */ (0, T.jsxs)(y, {
		className: "gap-3 p-4",
		children: [
			/* @__PURE__ */ (0, T.jsx)("h2", {
				className: "font-bold",
				children: "Data source — who wins on the board"
			}),
			/* @__PURE__ */ (0, T.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				role: "radiogroup",
				"aria-label": "Data source",
				children: [_("pms", "PMS", "The board shows the Transport days of the PMS, as now."), _("sigatulhaj", "Sigatul Haj", "The operator's live list on sigatulhaj.org wins for its SH numbers; other PMS trips stay. The board keeps this builder's look.")]
			}),
			o === "sigatulhaj" && /* @__PURE__ */ (0, T.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, T.jsxs)("label", {
					className: "grid gap-1 text-xs font-semibold",
					children: ["Sigatul Haj signage link", /* @__PURE__ */ (0, T.jsx)(b, {
						className: "h-9 font-mono text-xs",
						disabled: !n,
						value: c,
						onChange: (e) => l(e.target.value),
						placeholder: "https://sigatulhaj.org/signage/…"
					})]
				}), /* @__PURE__ */ (0, T.jsxs)("ul", {
					className: "list-disc pl-5 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, T.jsx)("li", { children: "Same SH number on both: Sigatul Haj's date, time, guests and names are shown; the PMS bus number stays." }),
						/* @__PURE__ */ (0, T.jsx)("li", { children: "A trip only on Sigatul Haj is added. A PMS trip of an SH number Sigatul Haj now shows on another trip is hidden." }),
						/* @__PURE__ */ (0, T.jsx)("li", { children: "PMS trips of other SH numbers stay. Checked about every 45 seconds; if Sigatul Haj cannot be reached, the board keeps the PMS trips." })
					]
				})]
			}),
			/* @__PURE__ */ (0, T.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					n && /* @__PURE__ */ (0, T.jsx)(v, {
						disabled: !g || f,
						onClick: async () => {
							p(!0);
							let e = await i({
								source: o,
								sh_url: c
							});
							p(!1), h(e || "Saved — the board switches within a minute."), !e && o === "sigatulhaj" && ee();
						},
						children: "Save data source"
					}),
					o === "sigatulhaj" && /* @__PURE__ */ (0, T.jsx)(v, {
						variant: "outline",
						disabled: f,
						onClick: () => void ee(),
						children: f ? "Checking…" : "🔄 Check Sigatul Haj now"
					}),
					m && /* @__PURE__ */ (0, T.jsx)("span", {
						className: "text-sm text-muted-foreground",
						children: m
					})
				]
			}),
			o === "sigatulhaj" && u && (u.ok ? /* @__PURE__ */ (0, T.jsxs)("div", {
				className: "grid gap-1.5",
				children: [
					/* @__PURE__ */ (0, T.jsxs)("p", {
						className: "text-sm",
						children: [
							/* @__PURE__ */ (0, T.jsxs)("b", {
								className: "text-emerald-700 dark:text-emerald-400",
								children: [
									"✔ Read ",
									u.rows.length,
									" trips"
								]
							}),
							" ",
							/* @__PURE__ */ (0, T.jsxs)("span", {
								className: "text-muted-foreground",
								children: ["at ", G(u.at)]
							})
						]
					}),
					/* @__PURE__ */ (0, T.jsx)("div", {
						className: "max-h-64 overflow-auto rounded-lg border",
						children: /* @__PURE__ */ (0, T.jsxs)("table", {
							className: "w-full text-xs",
							children: [/* @__PURE__ */ (0, T.jsx)("thead", {
								className: "sticky top-0 bg-muted",
								children: /* @__PURE__ */ (0, T.jsxs)("tr", {
									className: "text-left",
									children: [
										/* @__PURE__ */ (0, T.jsx)("th", {
											className: "p-1.5",
											children: "SH"
										}),
										/* @__PURE__ */ (0, T.jsx)("th", {
											className: "p-1.5",
											children: "Travel to"
										}),
										/* @__PURE__ */ (0, T.jsx)("th", {
											className: "p-1.5",
											children: "Date"
										}),
										/* @__PURE__ */ (0, T.jsx)("th", {
											className: "p-1.5",
											children: "Group"
										}),
										/* @__PURE__ */ (0, T.jsx)("th", {
											className: "p-1.5 text-right",
											children: "Pax"
										})
									]
								})
							}), /* @__PURE__ */ (0, T.jsx)("tbody", { children: u.rows.map((e, t) => /* @__PURE__ */ (0, T.jsxs)("tr", {
								className: "border-t",
								children: [
									/* @__PURE__ */ (0, T.jsx)("td", {
										className: "p-1.5 font-mono",
										children: e.ref
									}),
									/* @__PURE__ */ (0, T.jsx)("td", {
										className: "p-1.5",
										children: String(e.route).split("-").slice(1).join("-")
									}),
									/* @__PURE__ */ (0, T.jsx)("td", {
										className: "p-1.5 whitespace-nowrap",
										children: e.at.replace("T", " ")
									}),
									/* @__PURE__ */ (0, T.jsx)("td", {
										className: "p-1.5",
										children: [e.operator, e.leader].filter(Boolean).join(" · ")
									}),
									/* @__PURE__ */ (0, T.jsx)("td", {
										className: "p-1.5 text-right",
										children: e.pax
									})
								]
							}, t)) })]
						})
					}),
					/* @__PURE__ */ (0, T.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Its trip types are added to the Slides list below — give each one a template there."
					})
				]
			}) : /* @__PURE__ */ (0, T.jsxs)("p", {
				className: "text-sm text-destructive",
				children: ["Could not read Sigatul Haj: ", u.error]
			}))
		]
	});
}
// src/pages/signage-builder/SignageBuilderPage.tsx
var q = 10, be = (e, t, n) => Math.min(n, Math.max(t, e)), xe = (e) => JSON.parse(JSON.stringify(e)), Se = (e, t, n) => {
	let r = e / t;
	return [
		[0, n === "x" ? "left edge" : "top edge"],
		[.25, "¼"],
		[1 / 3, "⅓"],
		[.5, "middle"],
		[2 / 3, "⅔"],
		[.75, "¾"],
		[1, n === "x" ? "right edge" : "bottom edge"]
	].find(([e]) => Math.abs(e - r) < 1e-6)?.[1] ?? `${Math.round(e)} px · element`;
}, Ce = [
	["title", "🅃 Title"],
	["heading", "🏷️ Trip type heading"],
	["text", "✏️ Text"],
	["date", "📅 Date"],
	["sdate", "📆 Short date"],
	[
		"rdate",
		"🗓️ Relative date",
		"The date(s) of the trips shown on the slide — not today's"
	],
	["clock", "🕒 Clock"],
	["image", "🖼️ Image"],
	["table", "▦ Data table"]
];
function we({ start: e = "board" } = {}) {
	let { cloud: t, transport: a } = r(), c = a, l = n(), u = i(), { siteId: d } = s(), { href: f } = o(), { ask: p, dialog: g } = re(), S = t.canWrite(d), [C, ie] = (0, w.useState)(null), [E, oe] = (0, w.useState)(null), [j, M] = (0, w.useState)([]), [N, P] = (0, w.useState)({
		slides: [],
		version: 0
	}), [le, F] = (0, w.useState)([]), [I, L] = (0, w.useState)({
		id: null,
		name: "",
		version: 0,
		data: {
			elements: [],
			bg: {}
		}
	}), [R, z] = (0, w.useState)(null), [ue, de] = (0, w.useState)(!1), [fe, pe] = (0, w.useState)({
		t: "",
		bad: !1
	}), [, B] = (0, w.useState)(0), [V, me] = (0, w.useState)(1), [he, ge] = (0, w.useState)(!1), [_e, ve] = (0, w.useState)(c.today()), [ye, U] = (0, w.useState)(""), [W, G] = (0, w.useState)(1), [we, Te] = (0, w.useState)([]), [Ee, J] = (0, w.useState)([]), [De, Oe] = (0, w.useState)(.3), [ke, Ae] = (0, w.useState)(""), [Y, je] = (0, w.useState)(e), Me = (0, w.useRef)([]), Ne = (0, w.useRef)([]), Pe = (0, w.useRef)(""), Fe = (0, w.useRef)(0), Ie = (0, w.useRef)(I);
	Ie.current = I;
	let Le = (0, w.useRef)(R);
	Le.current = R;
	let Re = (0, w.useRef)(1);
	Re.current = V;
	let ze = (0, w.useRef)(null), Be = (0, w.useRef)(null), Ve = (0, w.useRef)(null), He = (e, t = !1) => pe({
		t: e,
		bad: t
	}), Ue = (e, t) => t ? Math.round(e) : Math.round(e / q) * q;
	(0, w.useEffect)(() => {
		(async () => {
			let [e, n] = await Promise.all([u("signage"), u("signage-api")]);
			ie(e), oe(n);
			try {
				let [t, r] = await l(Promise.all([n.loadSignage(d), n.loadTripTypes(d)]));
				P(t.config), M(t.templates), F(r), Oe(t.config.fade ?? .3), Ge(t.templates.find((t) => !e.isPdf(t)) ?? null, e), J(We(t.config, r));
			} catch (n) {
				He(n instanceof t.UserError ? n.message : "Could not load the signage settings.", !0), Ge(null, e);
			}
			S || He("This login can look but not change the signage.");
		})();
	}, []);
	function We(e, t) {
		let n = new Map(t.map((e) => [e.type, e])), r = (e.slides || []).map((e) => ({
			...e,
			...n.get(e.type) ? {
				trips: n.get(e.type).trips,
				last: n.get(e.type).last
			} : {
				trips: 0,
				last: ""
			}
		}));
		for (let e of t) r.some((t) => t.type === e.type) || r.push({
			type: e.type,
			template: "none",
			seconds: 15,
			trips: e.trips,
			last: e.last
		});
		return r;
	}
	function Ge(e, t = C, n) {
		let r = e ? {
			id: e.id,
			name: e.name,
			version: e.version,
			data: xe(e.data)
		} : {
			id: null,
			name: "",
			version: 0,
			data: n ?? t.classicLook()
		};
		r.data.bg = {
			color: "#ffffff",
			image: "",
			fit: "cover",
			...r.data.bg || {}
		}, r.data.elements = r.data.elements || [], Me.current = [], Ne.current = [], Pe.current = "", L(r), z(null), de(!1), He(r.id ? `Template “${r.name}”${e?.updated_at ? ` · saved ${new Date(e.updated_at).toLocaleString()}${e.updated_by ? " by " + e.updated_by : ""}` : ""}` : "New template — not saved yet.");
	}
	let X = (0, w.useCallback)((e, t = "") => {
		let n = Date.now();
		(!t || t !== Pe.current || n - Fe.current > 1e3) && (Me.current.push(JSON.stringify(Ie.current.data)), Me.current.length > 80 && Me.current.shift(), Ne.current = []), Pe.current = t, Fe.current = n;
		let r = xe(Ie.current.data);
		e(r), L((e) => ({
			...e,
			data: r
		})), de(!0), B((e) => e + 1);
	}, []);
	function Ke(e, t) {
		if (!e.length) return;
		t.push(JSON.stringify(Ie.current.data));
		let n = JSON.parse(e.pop());
		L((e) => ({
			...e,
			data: n
		})), Pe.current = "", de(!0), n.elements.some((e) => e.id === Le.current) || z(null), B((e) => e + 1);
	}
	let Z = I.data.elements.find((e) => e.id === R);
	(0, w.useEffect)(() => {
		(async () => {
			try {
				Te((await l(c.loadDay(d, _e))).rows || []);
			} catch {
				Te([]);
			}
		})();
	}, [_e]);
	let qe = (0, w.useMemo)(() => C ? C.tripsOf({
		rows: we,
		days: [_e],
		from: `${_e}T00:00`,
		to: `${_e}T23:59`
	}) : [], [
		C,
		we,
		_e
	]), Je = (0, w.useMemo)(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of qe) e.set(t.type, (e.get(t.type) || 0) + 1);
		return [...e].sort();
	}, [qe]), Ye = (0, w.useMemo)(() => {
		if (!C || !ye) return [];
		let e = C.buildSlides(qe, [{
			type: ye,
			template: -1,
			seconds: 15
		}], [{
			id: -1,
			data: I.data
		}]);
		return e.forEach((e) => {
			e.today = _e;
		}), e;
	}, [
		C,
		ye,
		qe,
		I.data,
		_e
	]), Xe = Ye[be(W, 1, Math.max(1, Ye.length)) - 1] || null;
	(0, w.useEffect)(() => {
		C && ze.current && C.renderTemplate(ze.current, I.data, Xe);
	}, [
		C,
		I.data,
		Xe
	]), (0, w.useEffect)(() => {
		if (!C || !Be.current) return;
		let e = () => {
			Be.current && me(Be.current.clientWidth / C.STAGE_W || 1);
		}, t = new ResizeObserver(e);
		return t.observe(Be.current), e(), () => t.disconnect();
	}, [C]);
	let [Ze, Qe] = (0, w.useState)({
		v: [],
		h: []
	});
	function $e(e, t, n, r, i, a) {
		let o = C.STAGE_W, s = C.STAGE_H, c = 8 / Math.max(.25, Re.current), l = Ie.current.data.elements.filter((t) => t.id !== e), u = [
			0,
			o / 4,
			o / 3,
			o / 2,
			2 * o / 3,
			3 * o / 4,
			o,
			...l.flatMap((e) => [
				e.x,
				e.x + e.w / 2,
				e.x + e.w
			])
		], d = [
			0,
			s / 4,
			s / 3,
			s / 2,
			2 * s / 3,
			3 * s / 4,
			s,
			...l.flatMap((e) => [
				e.y,
				e.y + e.h / 2,
				e.y + e.h
			])
		], f = (e, t) => {
			let n = Infinity, r = null;
			for (let i of e) for (let e of t) Math.abs(e - i) < Math.abs(n) && Math.abs(e - i) <= c && (n = e - i, r = e);
			return r === null ? null : {
				d: n,
				at: r
			};
		}, p = {
			l: t,
			c: t + r / 2,
			r: t + r
		}, m = {
			t: n,
			m: n + i / 2,
			b: n + i
		}, h = f(a.x.map((e) => p[e]), u), g = f(a.y.map((e) => m[e]), d), ee = h ? [h.at] : [], _ = g ? [g.at] : [];
		return {
			dx: h?.d ?? null,
			dy: g?.d ?? null,
			v: ee,
			h: _
		};
	}
	function et(e) {
		let t = e.target.closest(".sb-sel i"), n = t ? null : e.target.closest(".sb-stage > [data-id]");
		if (!t && !n) {
			z(null);
			return;
		}
		let r = n ? n.dataset.id : Le.current;
		n && r !== Le.current && z(r);
		let i = Ie.current.data.elements.find((e) => e.id === r);
		if (!i || !S) return;
		e.preventDefault(), Be.current?.focus({ preventScroll: !0 });
		let a = {
			x: e.clientX,
			y: e.clientY,
			e: { ...i }
		}, o = JSON.stringify(Ie.current.data), s = t?.dataset.h, c = !1, l = xe(i), u = (e) => {
			let t = (e.clientX - a.x) / Re.current, n = (e.clientY - a.y) / Re.current, i = e.shiftKey;
			if (!c && Math.abs(t) + Math.abs(n) < 2) return;
			c = !0;
			let o = a.e, u = {
				v: [],
				h: []
			};
			if (s) {
				let { x: e, y: a, w: c, h: d } = o;
				s.includes("e") && (c = Ue(o.w + t, i)), s.includes("s") && (d = Ue(o.h + n, i)), s.includes("w") && (e = Ue(o.x + t, i), c = o.w + (o.x - e)), s.includes("n") && (a = Ue(o.y + n, i), d = o.h + (o.y - a));
				let f = i ? null : $e(r, e, a, c, d, {
					x: s.includes("e") ? ["r"] : ["l"],
					y: s.includes("s") ? ["b"] : ["t"]
				});
				f?.dx != null && (s.includes("e") ? c += f.dx : (e += f.dx, c -= f.dx), u.v = f.v), f?.dy != null && (s.includes("s") ? d += f.dy : (a += f.dy, d -= f.dy), u.h = f.h), c >= 30 && (l.x = Math.round(e), l.w = Math.round(c)), d >= 30 && (l.y = Math.round(a), l.h = Math.round(d));
			} else {
				let e = i ? null : $e(r, o.x + t, o.y + n, o.w, o.h, {
					x: [
						"l",
						"c",
						"r"
					],
					y: [
						"t",
						"m",
						"b"
					]
				});
				l.x = be(e?.dx == null ? Ue(o.x + t, i) : Math.round(o.x + t + e.dx), -o.w + 40, C.STAGE_W - 40), l.y = be(e?.dy == null ? Ue(o.y + n, i) : Math.round(o.y + n + e.dy), -o.h + 40, C.STAGE_H - 40), e && (u = {
					v: e.dx == null ? [] : e.v,
					h: e.dy == null ? [] : e.h
				});
			}
			Qe(u);
			let d = ze.current?.querySelector(`[data-id="${CSS.escape(r)}"]`);
			d && Object.assign(d.style, {
				left: `${l.x}px`,
				top: `${l.y}px`,
				width: `${l.w}px`,
				height: `${l.h}px`
			});
			let f = Be.current?.querySelector(".sb-sel");
			f && Object.assign(f.style, {
				left: `${l.x * Re.current}px`,
				top: `${l.y * Re.current}px`,
				width: `${l.w * Re.current}px`,
				height: `${l.h * Re.current}px`
			});
		}, d = () => {
			if (removeEventListener("pointermove", u), removeEventListener("pointerup", d), Qe({
				v: [],
				h: []
			}), !c) return;
			Me.current.push(o), Ne.current = [], Pe.current = "";
			let e = xe(Ie.current.data), t = e.elements.find((e) => e.id === r);
			Object.assign(t, {
				x: l.x,
				y: l.y,
				w: l.w,
				h: l.h
			}), L((t) => ({
				...t,
				data: e
			})), de(!0);
		};
		addEventListener("pointermove", u), addEventListener("pointerup", d);
	}
	(0, w.useEffect)(() => {
		let e = (e) => {
			let t = document.activeElement;
			if (!t || !Be.current?.contains(t)) return;
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
				e.preventDefault(), e.shiftKey ? Ke(Ne.current, Me.current) : Ke(Me.current, Ne.current);
				return;
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
				e.preventDefault(), Ke(Ne.current, Me.current);
				return;
			}
			if (!Ie.current.data.elements.find((e) => e.id === Le.current) || !S) return;
			if (e.key === "Escape") {
				z(null);
				return;
			}
			if (e.key === "Delete" || e.key === "Backspace") {
				e.preventDefault(), tt();
				return;
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
				e.preventDefault(), nt();
				return;
			}
			let n = e.shiftKey ? 10 : 1, r = {
				ArrowLeft: [-n, 0],
				ArrowRight: [n, 0],
				ArrowUp: [0, -n],
				ArrowDown: [0, n]
			}[e.key];
			r && (e.preventDefault(), X((e) => {
				let t = e.elements.find((e) => e.id === Le.current);
				t.x += r[0], t.y += r[1];
			}, "nudge"));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}, [X, S]);
	function tt() {
		let e = Le.current;
		X((t) => {
			t.elements = t.elements.filter((t) => t.id !== e);
		}), z(null);
	}
	function nt() {
		let e = Ie.current.data.elements.find((e) => e.id === Le.current);
		if (!e) return;
		let t = {
			...xe(e),
			id: C.newElement("text").id,
			x: e.x + 30,
			y: e.y + 30
		};
		X((e) => {
			e.elements.push(t);
		}), z(t.id);
	}
	function rt(e, t, n) {
		if (!S) return;
		let r = C.newElement(e), i = Ie.current.data.elements.length;
		r.x = be(Ue(t == null ? 120 + i % 6 * 40 : t - r.w / 2, !1), 0, C.STAGE_W - Math.min(r.w, C.STAGE_W)), r.y = be(Ue(n == null ? 120 + i % 6 * 40 : n - r.h / 2, !1), 0, C.STAGE_H - Math.min(r.h, C.STAGE_H)), X((e) => {
			e.elements.push(r);
		}), z(r.id);
	}
	function it(e, t, n) {
		if (!S) return;
		let r = Ie.current.data.elements.filter((e) => e.type === "table"), i = t == null ? null : [...r].reverse().find((e) => t >= e.x && t <= e.x + e.w && n >= e.y && n <= e.y + e.h), a = Ie.current.data.elements.find((e) => e.id === Le.current), o = i || (a?.type === "table" ? a : r[0]);
		o ? (X((t) => {
			t.elements.find((e) => e.id === o.id).columns.push({
				field: e,
				title: C.FIELDS[e][0],
				align: "center"
			});
		}), z(o.id)) : He("Add a data table first, then drop columns on it.", !0);
	}
	let at = (e) => (t) => {
		t.dataTransfer.setData("text/plain", e), t.dataTransfer.effectAllowed = "copy";
	};
	function ot(e) {
		e.preventDefault(), ge(!1);
		let t = e.dataTransfer.getData("text/plain") || "", n = Be.current.getBoundingClientRect(), r = (e.clientX - n.left) / V, i = (e.clientY - n.top) / V;
		t.startsWith("add:") ? rt(t.slice(4), r, i) : t.startsWith("field:") && C.FIELDS[t.slice(6)] && it(t.slice(6), r, i);
	}
	async function st(e) {
		if (e) try {
			let t = await ce(e, 1920);
			X((e) => {
				e.bg.image = t;
			});
		} catch {
			He("Could not read that image.", !0);
		}
	}
	let ct = () => Math.round(JSON.stringify(I.data).length / 1024), lt = (e) => (N.slides || []).some((t) => String(t.template) === String(e)), ut = async () => !ue || await p({
		title: "Discard unsaved changes?",
		body: "This template has unsaved changes.",
		confirmLabel: "Discard"
	});
	async function dt(e) {
		let n = I.name.trim();
		if (!n) He("Give the template a name first.", !0);
		else if (ct() > 1700) He(`Too large (${ct()} KB) — use smaller or fewer images.`, !0);
		else try {
			let t = e && j.some((e) => e.name === n) ? `${n} (copy)` : n, r = I.id && !e ? await l(E.updateTemplate(I.id, n, I.data, I.version)) : await l(E.createTemplate(d, t, I.data));
			M((e) => [...e.filter((e) => e.id !== r.id), r].sort((e, t) => e.name.localeCompare(t.name))), Ge(r), He(`Saved “${r.name}” (${Math.round(JSON.stringify(r.data).length / 1024)} KB). ${lt(r.id) ? "The board shows it from its next slide." : "Choose below which trip types use it."}`);
		} catch (e) {
			He(e instanceof t.UserError ? e.message : "Could not save.", !0);
		}
	}
	async function ft() {
		if (!I.id) return;
		let e = (N.slides || []).filter((e) => String(e.template) === String(I.id)).map((e) => C.travelTo(e.type));
		if (await p({
			title: `Delete the template “${I.name}”?`,
			confirmLabel: "Delete",
			body: e.length ? `It is shown for ${e.join(", ")} — those trip types will not be on the board until you choose another template.` : void 0
		})) try {
			await l(E.deleteTemplate(I.id)), M((e) => e.filter((e) => e.id !== I.id)), Ge(null), He("Deleted.");
		} catch (e) {
			He(e.message || "Could not delete.", !0);
		}
	}
	async function pt(e, n = "Saved — the board uses it from its next slide.") {
		try {
			let t = await l(E.saveSignageConfig(d, {
				slides: e.map(({ type: e, template: t, seconds: n }) => ({
					type: e,
					template: t,
					seconds: n
				})),
				fade: De
			}, N.version));
			P(t.config), M(t.templates), J(We(t.config, le)), Ae(n);
		} catch (e) {
			Ae(e instanceof t.UserError ? e.message : "Could not save.");
		}
	}
	let mt = () => pt(Ee);
	async function ht(e) {
		try {
			let t = await l(E.saveSignageConfig(d, e, N.version));
			return P(t.config), M(t.templates), null;
		} catch (e) {
			return e instanceof t.UserError ? e.message : "Could not save.";
		}
	}
	let gt = (e) => J((t) => [...t, ...e.filter((e) => !t.some((t) => t.type === e)).map((e) => ({
		type: e,
		template: "classic",
		seconds: 15,
		trips: 0,
		last: "",
		fromSh: !0
	}))]), [_t, vt] = (0, w.useState)("");
	async function yt(e) {
		if (e && S) {
			if (!/\.pdf$/i.test(e.name) && e.type !== "application/pdf") Ae("Choose a PDF file.");
			else try {
				vt("Reading the PDF…");
				let t = await (await u("signage-pdf")).pdfPages(e, (e, t) => vt(`Drawing page ${e} of ${t}…`));
				vt("Saving…");
				let n = e.name.replace(/\.pdf$/i, "").slice(0, 50) || "PDF", r = await l(E.createTemplate(d, `📄 ${n}`, {
					kind: "pdf",
					file: e.name.slice(0, 100),
					pages: t,
					fit: "contain",
					bg: { color: "#000000" },
					elements: []
				}));
				M((e) => [...e, r]);
				let i = [...Ee, {
					type: `pdf:${r.id}`,
					template: r.id,
					seconds: 10,
					trips: 0,
					last: ""
				}];
				J(i), await pt(i, `PDF “${n}” added (${t.length} pages, 10 s each) — move it up or down, change the seconds, and save again if you change anything.`);
			} catch (e) {
				Ae(e?.message || "Could not read that PDF.");
			} finally {
				vt("");
			}
		}
	}
	async function bt(e) {
		let t = Dt(e);
		if (!await p({
			title: `Remove the PDF slide${t ? ` “${t.name}”` : ""}?`,
			confirmLabel: "Remove",
			body: "Its pages leave the board and are deleted."
		})) return;
		let n = Ee.filter((t) => t.type !== e.type);
		if (J(n), await pt(n, "PDF slide removed."), t) try {
			await l(E.deleteTemplate(t.id)), M((e) => e.filter((e) => e.id !== t.id));
		} catch {}
	}
	if (!C || !E) return /* @__PURE__ */ (0, T.jsx)("div", {
		className: "mx-auto max-w-[2400px] p-4 text-sm text-muted-foreground",
		children: "Loading…"
	});
	let xt = (e) => e.type === "table" ? `Data table (${(e.columns || []).length} columns)` : e.type === "image" ? "Image" : `Text: ${String(e.text || "").slice(0, 24) || "(empty)"}`, St = C.FONTS.map((e) => [e, e]), Q = (e, t, n = "") => X((n) => {
		let r = n.elements.find((e) => e.id === R);
		r && (r[e] = t);
	}, n || `${R}.${e}`), Ct = (e, t, n) => X((r) => {
		let i = r.elements.find((e) => e.id === R).columns[e];
		t !== "field" || i.title !== C.FIELDS[i.field]?.[0] && i.title || (i.title = C.FIELDS[n][0]), i[t] = n;
	}, `${R}.c${e}.${t}`), wt = (e) => {
		let t = (N.slides || []).filter((t) => String(t.template) === String(e.id)).map((e) => C.travelTo(e.type));
		return `${e.name}${t.length ? ` · shows ${t.join(", ")}` : ""}`;
	}, Tt = (e) => e ? `${e.toFixed(1)} s` : "cut", Et = j.filter((e) => !C.isPdf(e)), Dt = (e) => j.find((t) => C.isPdf(t) && String(t.id) === String(e.template)), Ot = (e) => typeof e.template == "number" && !j.some((t) => t.id === e.template), kt = (e, t) => {
		J((n) => {
			let r = [...n];
			return [r[e + t], r[e]] = [r[e], r[e + t]], r;
		}), Ae("Not saved yet.");
	}, At = (e, t) => {
		let n = Dt(e);
		return /* @__PURE__ */ (0, T.jsxs)("tr", {
			className: "border-b bg-accent/20",
			children: [
				/* @__PURE__ */ (0, T.jsxs)("td", {
					className: "whitespace-nowrap p-2",
					children: [
						/* @__PURE__ */ (0, T.jsx)(v, {
							size: "icon",
							variant: "outline",
							className: "size-7",
							"aria-label": "Move up",
							disabled: $ || !t,
							onClick: () => kt(t, -1),
							children: /* @__PURE__ */ (0, T.jsx)(_, { className: "size-4" })
						}),
						" ",
						/* @__PURE__ */ (0, T.jsx)(v, {
							size: "icon",
							variant: "outline",
							className: "size-7",
							"aria-label": "Move down",
							disabled: $ || t === Ee.length - 1,
							onClick: () => kt(t, 1),
							children: /* @__PURE__ */ (0, T.jsx)(ee, { className: "size-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, T.jsxs)("td", {
					className: "p-2",
					children: [/* @__PURE__ */ (0, T.jsxs)("b", { children: ["📄 ", n?.name || "PDF (deleted)"] }), /* @__PURE__ */ (0, T.jsxs)("small", {
						className: "block text-xs text-muted-foreground",
						children: ["PDF slide · ", n ? `${(n.data.pages || []).length} pages, one after another` : "its pages are gone — remove this row"]
					})]
				}),
				/* @__PURE__ */ (0, T.jsx)("td", {
					className: "p-2",
					children: n && /* @__PURE__ */ (0, T.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [(n.data.pages || []).slice(0, 4).map((e, t) => /* @__PURE__ */ (0, T.jsx)("img", {
							src: e,
							alt: `Page ${t + 1}`,
							className: "h-10 rounded border bg-white object-contain"
						}, t)), (n.data.pages || []).length > 4 && /* @__PURE__ */ (0, T.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: ["+", n.data.pages.length - 4]
						})]
					})
				}),
				/* @__PURE__ */ (0, T.jsx)("td", {
					className: "p-2",
					children: /* @__PURE__ */ (0, T.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, T.jsx)(b, {
								type: "number",
								min: 3,
								max: 600,
								className: "h-9 w-24",
								"aria-label": "Seconds a page",
								disabled: $,
								value: e.seconds,
								onChange: (e) => {
									let n = be(Number(e.target.value) || 10, 3, 600);
									J((e) => e.map((e, r) => r === t ? {
										...e,
										seconds: n
									} : e)), Ae("Not saved yet.");
								}
							}),
							/* @__PURE__ */ (0, T.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "s a page"
							}),
							S && /* @__PURE__ */ (0, T.jsxs)(v, {
								size: "sm",
								variant: "outline",
								className: "text-destructive",
								onClick: () => void bt(e),
								children: [/* @__PURE__ */ (0, T.jsx)(te, { className: "size-3.5" }), "Remove"]
							})
						]
					})
				})
			]
		}, e.type);
	}, $ = !S;
	return /* @__PURE__ */ (0, T.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, T.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, T.jsxs)("div", { children: [/* @__PURE__ */ (0, T.jsx)("h1", {
					className: "text-2xl font-bold text-primary",
					children: "Signage Builder"
				}), /* @__PURE__ */ (0, T.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Design the transport board: drag elements onto the screen, pick the table's columns, save it as a template — then choose below which template each trip type is shown with."
				})] }), /* @__PURE__ */ (0, T.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, T.jsx)(v, {
						asChild: !0,
						variant: "outline",
						children: /* @__PURE__ */ (0, T.jsx)("a", {
							href: f("transport"),
							children: "🚌 Transport day"
						})
					}), /* @__PURE__ */ (0, T.jsx)(v, {
						asChild: !0,
						children: /* @__PURE__ */ (0, T.jsx)("a", {
							href: `${d}/signage`,
							target: "_blank",
							rel: "noopener",
							children: "📺 Open the board ↗"
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, T.jsx)("nav", {
				className: "flex flex-wrap gap-1 border-b",
				"aria-label": "Screens",
				children: [
					["board", "🚌 Transport board"],
					[1, "📺 Screen 1 (/signage1)"],
					[2, "📺 Screen 2 (/signage2)"]
				].map(([e, t]) => /* @__PURE__ */ (0, T.jsx)("button", {
					type: "button",
					className: x("-mb-px rounded-t-md border border-transparent px-3 py-1.5 text-sm font-semibold", Y === e ? "border-border border-b-background bg-background text-primary" : "text-muted-foreground hover:text-foreground"),
					onClick: async () => {
						(Y !== "board" || e === "board" || await ut()) && (z(null), je(e));
					},
					children: t
				}, e))
			}),
			Y === "board" ? /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
				/* @__PURE__ */ (0, T.jsxs)(y, {
					className: "flex-row flex-wrap items-end gap-3 p-3",
					children: [
						/* @__PURE__ */ (0, T.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, T.jsx)(m, { children: "Template" }), /* @__PURE__ */ (0, T.jsxs)("select", {
								"aria-label": "Template",
								className: "h-9 min-w-48 rounded-md border bg-background px-2 text-sm",
								value: I.id ?? "",
								onChange: async (e) => {
									let t = j.find((t) => String(t.id) === e.target.value);
									t && await ut() && Ge(t);
								},
								children: [!I.id && /* @__PURE__ */ (0, T.jsx)("option", {
									value: "",
									children: "— new, not saved yet —"
								}), Et.map((e) => /* @__PURE__ */ (0, T.jsx)("option", {
									value: e.id,
									children: wt(e)
								}, e.id))]
							})]
						}),
						/* @__PURE__ */ (0, T.jsxs)("div", {
							className: "grid min-w-48 flex-1 gap-1",
							children: [/* @__PURE__ */ (0, T.jsx)(m, {
								htmlFor: "sbName",
								children: "Name"
							}), /* @__PURE__ */ (0, T.jsx)(b, {
								id: "sbName",
								maxLength: 60,
								placeholder: "e.g. Madina big screen",
								disabled: $,
								value: I.name,
								onChange: (e) => {
									let t = e.target.value;
									L((e) => ({
										...e,
										name: t
									})), de(!0);
								}
							})]
						}),
						/* @__PURE__ */ (0, T.jsxs)("div", {
							className: "flex flex-wrap gap-1.5",
							children: [
								/* @__PURE__ */ (0, T.jsx)(v, {
									variant: "outline",
									disabled: $,
									onClick: async () => {
										await ut() && Ge(null, C, C.blankTemplate());
									},
									children: "＋ Blank"
								}),
								/* @__PURE__ */ (0, T.jsx)(v, {
									variant: "outline",
									disabled: $,
									onClick: async () => {
										await ut() && Ge(null);
									},
									children: "＋ From Classic look"
								}),
								/* @__PURE__ */ (0, T.jsx)(v, {
									variant: "outline",
									size: "icon",
									title: "Undo (Ctrl+Z)",
									"aria-label": "Undo",
									disabled: !Me.current.length,
									onClick: () => Ke(Me.current, Ne.current),
									children: /* @__PURE__ */ (0, T.jsx)(ne, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, T.jsx)(v, {
									variant: "outline",
									size: "icon",
									title: "Redo (Ctrl+Y)",
									"aria-label": "Redo",
									disabled: !Ne.current.length,
									onClick: () => Ke(Ne.current, Me.current),
									children: /* @__PURE__ */ (0, T.jsx)(ae, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, T.jsxs)(v, {
									disabled: $,
									onClick: () => void dt(!1),
									children: ["💾 Save", ue ? " *" : ""]
								}),
								/* @__PURE__ */ (0, T.jsx)(v, {
									variant: "outline",
									disabled: !I.id || $,
									onClick: () => void dt(!0),
									children: "Save as copy"
								}),
								/* @__PURE__ */ (0, T.jsx)(v, {
									variant: "outline",
									className: "text-destructive",
									disabled: !I.id || $,
									onClick: () => void ft(),
									children: "Delete"
								})
							]
						}),
						/* @__PURE__ */ (0, T.jsx)("span", {
							className: x("basis-full text-sm", fe.bad ? "text-destructive" : "text-muted-foreground"),
							children: fe.t
						})
					]
				}),
				/* @__PURE__ */ (0, T.jsxs)("div", {
					className: "grid items-start gap-3 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_300px]",
					children: [
						/* @__PURE__ */ (0, T.jsxs)(y, {
							className: "grid content-start gap-2 p-3 lg:max-h-[calc(100vh-140px)] lg:overflow-auto",
							children: [
								/* @__PURE__ */ (0, T.jsxs)("h3", {
									className: "text-sm font-bold text-primary",
									children: ["Elements ", /* @__PURE__ */ (0, T.jsx)("small", {
										className: "font-normal text-muted-foreground",
										children: "drag onto the screen, or tap"
									})]
								}),
								/* @__PURE__ */ (0, T.jsx)("div", {
									className: "flex flex-wrap gap-1.5",
									children: Ce.map(([e, t, n]) => /* @__PURE__ */ (0, T.jsx)("button", {
										type: "button",
										draggable: !0,
										title: n,
										className: "cursor-grab touch-none rounded-full border bg-accent/40 px-2.5 py-1 text-xs font-semibold hover:border-gold",
										onDragStart: at(`add:${e}`),
										onClick: () => rt(e),
										children: t
									}, e))
								}),
								/* @__PURE__ */ (0, T.jsxs)("h3", {
									className: "text-sm font-bold text-primary",
									children: ["Columns ", /* @__PURE__ */ (0, T.jsx)("small", {
										className: "font-normal text-muted-foreground",
										children: "drag onto the table"
									})]
								}),
								/* @__PURE__ */ (0, T.jsx)("div", {
									className: "flex flex-wrap gap-1.5",
									children: Object.entries(C.FIELDS).map(([e, [t]]) => /* @__PURE__ */ (0, T.jsx)("button", {
										type: "button",
										draggable: !0,
										className: "cursor-grab touch-none rounded-full border border-dashed bg-accent/20 px-2.5 py-1 text-xs font-semibold hover:border-gold",
										onDragStart: at(`field:${e}`),
										onClick: () => it(e),
										children: t
									}, e))
								}),
								/* @__PURE__ */ (0, T.jsx)("h3", {
									className: "text-sm font-bold text-primary",
									children: "Background"
								}),
								/* @__PURE__ */ (0, T.jsxs)("div", {
									className: "grid gap-1.5 text-sm",
									children: [
										/* @__PURE__ */ (0, T.jsx)(D, {
											as: "color",
											label: "Colour",
											value: /^#[0-9a-f]{6}$/i.test(I.data.bg?.color || "") ? I.data.bg.color : "#ffffff",
											disabled: $,
											onChange: (e) => X((t) => {
												t.bg.color = e;
											}, "bgcolor")
										}),
										/* @__PURE__ */ (0, T.jsxs)("label", {
											className: "grid grid-cols-[5.5rem_1fr] items-center gap-1.5 text-xs font-semibold",
											children: ["Image", /* @__PURE__ */ (0, T.jsx)("input", {
												type: "file",
												accept: "image/*",
												disabled: $,
												className: "min-w-0 text-xs",
												onChange: (e) => {
													let t = e.target.files?.[0];
													e.target.value = "", st(t);
												}
											})]
										}),
										/* @__PURE__ */ (0, T.jsx)(O, {
											label: "Fit",
											value: I.data.bg?.fit || "cover",
											disabled: $,
											list: [
												["cover", "Cover the screen"],
												["contain", "Whole image"],
												["fill", "Stretch"]
											],
											onChange: (e) => X((t) => {
												t.bg.fit = e;
											})
										}),
										/* @__PURE__ */ (0, T.jsx)(v, {
											variant: "outline",
											size: "sm",
											disabled: $ || !I.data.bg?.image,
											onClick: () => X((e) => {
												e.bg.image = "";
											}),
											children: "Remove image"
										})
									]
								}),
								/* @__PURE__ */ (0, T.jsx)("h3", {
									className: "text-sm font-bold text-primary",
									children: "Preview with real trips"
								}),
								/* @__PURE__ */ (0, T.jsxs)("div", {
									className: "grid gap-1.5 text-sm",
									children: [
										/* @__PURE__ */ (0, T.jsxs)("label", {
											className: "grid grid-cols-[5.5rem_1fr] items-center gap-1.5 text-xs font-semibold",
											children: ["Day", /* @__PURE__ */ (0, T.jsx)(b, {
												type: "date",
												className: "h-8",
												value: _e,
												onChange: (e) => {
													ve(e.target.value), G(1);
												}
											})]
										}),
										/* @__PURE__ */ (0, T.jsx)(O, {
											label: "Trip type",
											value: ye,
											list: [["", "Sample rows"], ...Je.map(([e, t]) => [e, `${C.travelTo(e)} (${t})`])],
											onChange: (e) => {
												U(e), G(1);
											}
										}),
										/* @__PURE__ */ (0, T.jsx)(O, {
											label: "Page",
											value: String(be(W, 1, Math.max(1, Ye.length))),
											list: (Ye.length ? Ye : [null]).map((e, t) => [String(t + 1), `${t + 1}${Ye.length ? ` of ${Ye.length}` : ""}`]),
											onChange: (e) => G(Number(e))
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, T.jsxs)("div", {
							className: "grid min-w-0 gap-1.5",
							children: [/* @__PURE__ */ (0, T.jsxs)("div", {
								ref: Be,
								tabIndex: 0,
								"aria-label": "Signage screen (1920 × 1080)",
								onPointerDown: et,
								onDragOver: (e) => {
									e.preventDefault(), e.dataTransfer.dropEffect = "copy", ge(!0);
								},
								onDragLeave: () => ge(!1),
								onDrop: ot,
								className: x("sb-canvas relative aspect-video w-full overflow-hidden rounded-lg shadow-md outline-none ring-1 ring-border focus-visible:ring-2 focus-visible:ring-gold", he && "ring-2 ring-ok"),
								style: { background: "repeating-conic-gradient(#f3ead6 0 25%, #fff 0 50%) 0 0 / 24px 24px" },
								children: [
									/* @__PURE__ */ (0, T.jsx)("div", {
										ref: ze,
										className: "sb-stage absolute left-0 top-0 origin-top-left [&>div]:cursor-move [&>div:hover]:outline-2 [&>div:hover]:-outline-offset-2 [&>div:hover]:outline-dashed [&>div:hover]:outline-blue-700/50",
										style: { transform: `scale(${V})` }
									}),
									Z && /* @__PURE__ */ (0, T.jsx)("div", {
										className: "sb-sel pointer-events-none absolute box-border border-2 border-blue-700",
										style: {
											left: Z.x * V,
											top: Z.y * V,
											width: Z.w * V,
											height: Z.h * V
										},
										children: [
											"nw",
											"ne",
											"sw",
											"se"
										].map((e) => /* @__PURE__ */ (0, T.jsx)("i", {
											"data-h": e,
											className: x("pointer-events-auto absolute size-3.5 rounded-sm border-2 border-blue-700 bg-white", e[0] === "n" ? "-top-2" : "-bottom-2", e[1] === "w" ? "-left-2" : "-right-2", e === "nw" || e === "se" ? "cursor-nwse-resize" : "cursor-nesw-resize")
										}, e))
									}),
									Ze.v.map((e) => /* @__PURE__ */ (0, T.jsx)("div", {
										"aria-hidden": !0,
										className: "pointer-events-none absolute top-0 h-full w-px bg-pink-600",
										style: { left: e * V },
										children: /* @__PURE__ */ (0, T.jsx)("span", {
											className: "absolute left-1 top-1 rounded bg-pink-600 px-1 text-[10px] text-white",
											children: Se(e, C.STAGE_W, "x")
										})
									}, `v${e}`)),
									Ze.h.map((e) => /* @__PURE__ */ (0, T.jsx)("div", {
										"aria-hidden": !0,
										className: "pointer-events-none absolute left-0 h-px w-full bg-pink-600",
										style: { top: e * V },
										children: /* @__PURE__ */ (0, T.jsx)("span", {
											className: "absolute left-1 top-1 rounded bg-pink-600 px-1 text-[10px] text-white",
											children: Se(e, C.STAGE_H, "y")
										})
									}, `h${e}`))
								]
							}), /* @__PURE__ */ (0, T.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"1920 × 1080 screen. Drag to move, corners to resize — edges and middles snap to the screen's middle, thirds, quarters and edges and to the other elements (pink guide lines), otherwise to 10 px; hold Shift for free. Arrow keys nudge, Delete removes. Texts can hold ",
									/* @__PURE__ */ (0, T.jsx)("code", { children: "{type}" }),
									" ",
									/* @__PURE__ */ (0, T.jsx)("code", { children: "{date}" }),
									" ",
									/* @__PURE__ */ (0, T.jsx)("code", { children: "{sdate}" }),
									" ",
									/* @__PURE__ */ (0, T.jsx)("code", { children: "{rdate}" }),
									" ",
									/* @__PURE__ */ (0, T.jsx)("code", { children: "{time}" }),
									" ",
									/* @__PURE__ */ (0, T.jsx)("code", { children: "{page}" }),
									"/",
									/* @__PURE__ */ (0, T.jsx)("code", { children: "{pages}" }),
									" ",
									/* @__PURE__ */ (0, T.jsx)("code", { children: "{trips}" }),
									" ",
									/* @__PURE__ */ (0, T.jsx)("code", { children: "{pax}" }),
									"."
								]
							})]
						}),
						/* @__PURE__ */ (0, T.jsx)(y, {
							className: "grid content-start gap-2 p-3 lg:col-span-2 xl:col-span-1 xl:max-h-[calc(100vh-140px)] xl:overflow-auto",
							children: Z ? /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
								/* @__PURE__ */ (0, T.jsx)("h3", {
									className: "text-sm font-bold text-primary",
									children: xt(Z)
								}),
								/* @__PURE__ */ (0, T.jsxs)("div", {
									className: "flex flex-wrap gap-1.5",
									children: [
										/* @__PURE__ */ (0, T.jsx)(v, {
											size: "sm",
											variant: "outline",
											disabled: $,
											onClick: () => X((e) => {
												let t = e.elements.filter((e) => e.id !== R), n = e.elements.find((e) => e.id === R);
												e.elements = [...t, n];
											}),
											children: "Bring to front"
										}),
										/* @__PURE__ */ (0, T.jsx)(v, {
											size: "sm",
											variant: "outline",
											disabled: $,
											onClick: () => X((e) => {
												let t = e.elements.filter((e) => e.id !== R);
												e.elements = [e.elements.find((e) => e.id === R), ...t];
											}),
											children: "Send to back"
										}),
										/* @__PURE__ */ (0, T.jsx)(v, {
											size: "sm",
											variant: "outline",
											disabled: $,
											onClick: nt,
											children: "Duplicate"
										}),
										/* @__PURE__ */ (0, T.jsxs)(v, {
											size: "sm",
											variant: "outline",
											className: "text-destructive",
											disabled: $,
											onClick: tt,
											children: [/* @__PURE__ */ (0, T.jsx)(te, { className: "size-3.5" }), "Delete"]
										})
									]
								}),
								/* @__PURE__ */ (0, T.jsx)("div", {
									className: "grid grid-cols-2 gap-1.5",
									children: [
										"x",
										"y",
										"w",
										"h"
									].map((e) => /* @__PURE__ */ (0, T.jsx)(D, {
										label: e.toUpperCase(),
										value: Z[e],
										min: e === "w" || e === "h" ? 30 : -2e3,
										max: 4e3,
										disabled: $,
										onChange: (t) => {
											t !== null && Q(e, t);
										}
									}, e))
								}),
								Z.type === "text" && /* @__PURE__ */ (0, T.jsxs)("div", {
									className: "grid gap-1.5",
									children: [
										/* @__PURE__ */ (0, T.jsx)(A, {
											label: "Text",
											value: Z.text,
											disabled: $,
											onChange: (e) => Q("text", e)
										}),
										/* @__PURE__ */ (0, T.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: [
												"{type}",
												" trip type · ",
												"{date}",
												" · ",
												"{sdate}",
												" dd/mm/yyyy · ",
												"{rdate}",
												" the rows' date(s) · ",
												"{time}",
												" clock · ",
												"{page}",
												" / ",
												"{pages}",
												" · ",
												"{trips}",
												" · ",
												"{pax}"
											]
										}),
										/* @__PURE__ */ (0, T.jsx)(O, {
											label: "Font",
											value: Z.font,
											list: St,
											disabled: $,
											onChange: (e) => Q("font", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											label: "Size (px)",
											value: Z.size,
											min: 8,
											max: 400,
											disabled: $,
											onChange: (e) => e !== null && Q("size", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											as: "color",
											label: "Colour",
											value: Z.color,
											disabled: $,
											onChange: (e) => Q("color", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											as: "color",
											label: "Box colour",
											value: Z.bg,
											none: !0,
											disabled: $,
											onChange: (e) => Q("bg", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(O, {
											label: "Align",
											value: Z.align,
											list: [
												["left", "Left"],
												["center", "Centre"],
												["right", "Right"]
											],
											disabled: $,
											onChange: (e) => Q("align", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(O, {
											label: "Vertical",
											value: Z.valign,
											list: [
												["top", "Top"],
												["middle", "Middle"],
												["bottom", "Bottom"]
											],
											disabled: $,
											onChange: (e) => Q("valign", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(k, {
											label: "Bold",
											value: Z.bold,
											disabled: $,
											onChange: (e) => Q("bold", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(k, {
											label: "Italic",
											value: Z.italic,
											disabled: $,
											onChange: (e) => Q("italic", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(k, {
											label: "Underline",
											value: Z.underline,
											disabled: $,
											onChange: (e) => Q("underline", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											label: "Corners",
											value: Z.radius,
											min: 0,
											max: 500,
											disabled: $,
											onChange: (e) => Q("radius", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											label: "Padding",
											value: Z.pad ?? 8,
											min: 0,
											max: 200,
											disabled: $,
											onChange: (e) => Q("pad", e)
										})
									]
								}),
								Z.type === "image" && /* @__PURE__ */ (0, T.jsxs)("div", {
									className: "grid gap-1.5",
									children: [
										/* @__PURE__ */ (0, T.jsxs)("label", {
											className: "grid grid-cols-[5.5rem_1fr] items-center gap-1.5 text-xs font-semibold",
											children: ["Picture", /* @__PURE__ */ (0, T.jsx)("input", {
												type: "file",
												accept: "image/*",
												disabled: $,
												className: "min-w-0 text-xs",
												onChange: async (e) => {
													let t = e.target.files?.[0];
													if (t) try {
														let e = await ce(t, 1200);
														Q("src", e, "");
													} catch {
														He("Could not read that image.", !0);
													}
												}
											})]
										}),
										/* @__PURE__ */ (0, T.jsx)(O, {
											label: "Fit",
											value: Z.fit,
											list: [
												["contain", "Whole image"],
												["cover", "Fill the box"],
												["fill", "Stretch"]
											],
											disabled: $,
											onChange: (e) => Q("fit", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											label: "Corners",
											value: Z.radius,
											min: 0,
											max: 1e3,
											disabled: $,
											onChange: (e) => Q("radius", e)
										}),
										/* @__PURE__ */ (0, T.jsxs)("label", {
											className: "grid grid-cols-[5.5rem_1fr] items-center gap-1.5 text-xs font-semibold",
											children: ["Opacity", /* @__PURE__ */ (0, T.jsx)(h, {
												min: 0,
												max: 1,
												step: .05,
												value: [Z.opacity ?? 1],
												disabled: $,
												onValueChange: (e) => Q("opacity", e[0])
											})]
										})
									]
								}),
								Z.type === "table" && /* @__PURE__ */ (0, T.jsxs)("div", {
									className: "grid gap-1.5",
									children: [
										/* @__PURE__ */ (0, T.jsx)(D, {
											label: "Rows / page",
											value: Z.rows,
											min: 1,
											max: 30,
											disabled: $,
											onChange: (e) => e !== null && Q("rows", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											label: "Row height",
											value: Z.rowHeight || "",
											min: 0,
											max: 400,
											disabled: $,
											onChange: (e) => Q("rowHeight", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(O, {
											label: "Font",
											value: Z.font,
											list: St,
											disabled: $,
											onChange: (e) => Q("font", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											label: "Text size",
											value: Z.size,
											min: 8,
											max: 120,
											disabled: $,
											onChange: (e) => e !== null && Q("size", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(O, {
											label: "Heading font",
											value: Z.headFont || "",
											list: [["", "Same as the table"], ...St],
											disabled: $,
											onChange: (e) => Q("headFont", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											label: "Heading size",
											value: Z.headSize,
											min: 8,
											max: 120,
											disabled: $,
											onChange: (e) => Q("headSize", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											as: "color",
											label: "Heading bg",
											value: Z.headBg,
											disabled: $,
											onChange: (e) => Q("headBg", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											as: "color",
											label: "Heading text",
											value: Z.headColor,
											disabled: $,
											onChange: (e) => Q("headColor", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											as: "color",
											label: "Rows",
											value: Z.rowBg,
											disabled: $,
											onChange: (e) => Q("rowBg", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											as: "color",
											label: "Every 2nd row",
											value: Z.altBg,
											none: !0,
											disabled: $,
											onChange: (e) => Q("altBg", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											as: "color",
											label: "Row text",
											value: Z.color,
											disabled: $,
											onChange: (e) => Q("color", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											as: "color",
											label: "2nd row text",
											value: Z.altColor,
											none: !0,
											disabled: $,
											onChange: (e) => Q("altColor", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											as: "color",
											label: "Lines",
											value: Z.line,
											disabled: $,
											onChange: (e) => Q("line", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											label: "Line thickness",
											value: Z.lineW ?? 1,
											min: 0,
											max: 20,
											disabled: $,
											onChange: (e) => Q("lineW", e ?? 1)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											label: "Column lines",
											value: Z.colW ?? 0,
											min: 0,
											max: 20,
											disabled: $,
											onChange: (e) => Q("colW", e ?? 0)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											as: "color",
											label: "Column colour",
											value: Z.colLine || Z.line,
											disabled: $,
											onChange: (e) => Q("colLine", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(D, {
											label: "Heading corners",
											value: Z.radius,
											min: 0,
											max: 100,
											disabled: $,
											onChange: (e) => Q("radius", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(k, {
											label: "Write “Travel To” once per group of rows",
											value: Z.merge,
											disabled: $,
											onChange: (e) => Q("merge", e)
										}),
										/* @__PURE__ */ (0, T.jsx)(k, {
											label: "Share pages between trip types (like Classic)",
											value: Z.combine,
											disabled: $,
											onChange: (e) => Q("combine", e)
										}),
										/* @__PURE__ */ (0, T.jsxs)("h3", {
											className: "text-sm font-bold text-primary",
											children: ["Columns ", /* @__PURE__ */ (0, T.jsx)("small", {
												className: "font-normal text-muted-foreground",
												children: "drag ⠿ to reorder"
											})]
										}),
										/* @__PURE__ */ (0, T.jsx)("div", {
											className: "grid gap-1.5",
											children: (Z.columns || []).map((e, t) => /* @__PURE__ */ (0, T.jsx)(se, {
												c: e,
												fields: C.FIELDS,
												fonts: St,
												disabled: $,
												onDragStart: () => {
													Ve.current = t;
												},
												onDrop: () => {
													let e = Ve.current;
													Ve.current = null, e != null && e !== t && X((n) => {
														let r = n.elements.find((e) => e.id === R), [i] = r.columns.splice(e, 1);
														r.columns.splice(t, 0, i);
													});
												},
												onSet: (e, n) => Ct(t, e, n),
												onDelete: () => X((e) => {
													e.elements.find((e) => e.id === R).columns.splice(t, 1);
												})
											}, t))
										}),
										/* @__PURE__ */ (0, T.jsx)(O, {
											label: "＋ Add column…",
											value: "",
											disabled: $,
											list: [["", "＋ Add column…"], ...Object.entries(C.FIELDS).map(([e, [t]]) => [e, t])],
											onChange: (e) => e && X((t) => {
												t.elements.find((e) => e.id === R).columns.push({
													field: e,
													title: C.FIELDS[e][0],
													align: "center"
												});
											})
										})
									]
								})
							] }) : /* @__PURE__ */ (0, T.jsxs)(T.Fragment, { children: [
								/* @__PURE__ */ (0, T.jsx)("h3", {
									className: "text-sm font-bold text-primary",
									children: "Selected element"
								}),
								/* @__PURE__ */ (0, T.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "Tap an element on the screen to change it, or drag one in from the left."
								}),
								/* @__PURE__ */ (0, T.jsx)("h3", {
									className: "text-sm font-bold text-primary",
									children: "Layers"
								}),
								/* @__PURE__ */ (0, T.jsxs)("div", {
									className: "grid gap-1",
									children: [[...I.data.elements].reverse().map((e) => /* @__PURE__ */ (0, T.jsx)(v, {
										variant: "outline",
										size: "sm",
										className: "justify-start",
										onClick: () => z(e.id),
										children: xt(e)
									}, e.id)), !I.data.elements.length && /* @__PURE__ */ (0, T.jsx)("span", {
										className: "text-sm text-muted-foreground",
										children: "Empty screen."
									})]
								})
							] })
						})
					]
				}),
				d === "makkah" && /* @__PURE__ */ (0, T.jsx)(K, {
					cfg: N,
					siteId: d,
					writable: S,
					cloud: t,
					save: ht,
					onRoutes: gt
				}),
				"   ",
				/* @__PURE__ */ (0, T.jsxs)(y, {
					className: "gap-3 p-4",
					children: [
						/* @__PURE__ */ (0, T.jsx)("h2", {
							className: "font-bold",
							children: "Slides — which template for which trip type"
						}),
						/* @__PURE__ */ (0, T.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"Every trip type found in the imported transport lists. The board shows them in this order, each slide for its seconds; a type with no trips in the window is skipped. Types on ",
								/* @__PURE__ */ (0, T.jsx)("b", { children: "Classic" }),
								" (or on a template whose table has “share pages” ticked) share their pages. The window (which days and hours) is set on the Transport day page."
							]
						}),
						Ee.length ? /* @__PURE__ */ (0, T.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, T.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, T.jsx)("thead", { children: /* @__PURE__ */ (0, T.jsxs)("tr", {
									className: "border-b text-left",
									children: [
										/* @__PURE__ */ (0, T.jsx)("th", {
											className: "p-2",
											children: "Order"
										}),
										/* @__PURE__ */ (0, T.jsx)("th", {
											className: "p-2",
											children: "Trip type"
										}),
										/* @__PURE__ */ (0, T.jsx)("th", {
											className: "p-2",
											children: "Template"
										}),
										/* @__PURE__ */ (0, T.jsx)("th", {
											className: "p-2",
											children: "Seconds a slide"
										})
									]
								}) }), /* @__PURE__ */ (0, T.jsx)("tbody", { children: Ee.map((e, t) => String(e.type).startsWith("pdf:") ? At(e, t) : /* @__PURE__ */ (0, T.jsxs)("tr", {
									className: x("border-b", e.template === "none" && "opacity-70"),
									children: [
										/* @__PURE__ */ (0, T.jsxs)("td", {
											className: "whitespace-nowrap p-2",
											children: [
												/* @__PURE__ */ (0, T.jsx)(v, {
													size: "icon",
													variant: "outline",
													className: "size-7",
													"aria-label": "Move up",
													disabled: $ || !t,
													onClick: () => {
														J((e) => {
															let n = [...e];
															return [n[t - 1], n[t]] = [n[t], n[t - 1]], n;
														}), Ae("Not saved yet.");
													},
													children: /* @__PURE__ */ (0, T.jsx)(_, { className: "size-4" })
												}),
												" ",
												/* @__PURE__ */ (0, T.jsx)(v, {
													size: "icon",
													variant: "outline",
													className: "size-7",
													"aria-label": "Move down",
													disabled: $ || t === Ee.length - 1,
													onClick: () => {
														J((e) => {
															let n = [...e];
															return [n[t + 1], n[t]] = [n[t], n[t + 1]], n;
														}), Ae("Not saved yet.");
													},
													children: /* @__PURE__ */ (0, T.jsx)(ee, { className: "size-4" })
												})
											]
										}),
										/* @__PURE__ */ (0, T.jsxs)("td", {
											className: "p-2",
											children: [/* @__PURE__ */ (0, T.jsx)("b", { children: C.travelTo(e.type) }), /* @__PURE__ */ (0, T.jsxs)("small", {
												className: "block text-xs text-muted-foreground",
												children: [
													e.type,
													" · ",
													e.trips ? `${e.trips} trips, last ${e.last}` : e.fromSh ? "from Sigatul Haj — save the slides to keep it" : "no trips saved yet"
												]
											})]
										}),
										/* @__PURE__ */ (0, T.jsxs)("td", {
											className: "p-2",
											children: [/* @__PURE__ */ (0, T.jsx)("select", {
												"aria-label": "Template",
												disabled: $,
												className: "h-9 rounded-md border bg-background px-2 text-sm",
												value: String(e.template),
												onChange: (e) => {
													let n = e.target.value;
													J((e) => e.map((e, r) => r === t ? {
														...e,
														template: n === "none" || n === "classic" ? n : Number(n)
													} : e)), Ae("Not saved yet.");
												},
												children: [
													["none", "— not shown —"],
													["classic", "Classic (sigatulhaj layout)"],
													...Et.map((e) => [String(e.id), e.name]),
													...Ot(e) ? [[String(e.template), "⚠ deleted template"]] : []
												].map(([e, t]) => /* @__PURE__ */ (0, T.jsx)("option", {
													value: e,
													children: t
												}, e))
											}), Ot(e) && /* @__PURE__ */ (0, T.jsx)("small", {
												className: "block text-xs text-destructive",
												children: "Its template was deleted — the board shows these trips in the Classic layout. Pick a template."
											})]
										}),
										/* @__PURE__ */ (0, T.jsx)("td", {
											className: "p-2",
											children: /* @__PURE__ */ (0, T.jsx)(b, {
												type: "number",
												min: 3,
												max: 600,
												className: "h-9 w-24",
												disabled: $,
												value: e.seconds,
												onChange: (e) => {
													let n = be(Number(e.target.value) || 15, 3, 600);
													J((e) => e.map((e, r) => r === t ? {
														...e,
														seconds: n
													} : e)), Ae("Not saved yet.");
												}
											})
										})
									]
								}, e.type)) })]
							})
						}) : /* @__PURE__ */ (0, T.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No trip types yet — import a transport list first."
						}),
						/* @__PURE__ */ (0, T.jsxs)("div", {
							className: "flex flex-wrap items-center gap-3",
							children: [
								/* @__PURE__ */ (0, T.jsxs)("label", {
									className: "flex items-center gap-2 text-sm font-semibold text-muted-foreground",
									children: [
										"Transition between slides ",
										/* @__PURE__ */ (0, T.jsx)(h, {
											className: "w-40",
											min: 0,
											max: 3,
											step: .1,
											value: [De],
											disabled: $,
											onValueChange: (e) => {
												Oe(e[0]), Ae("Not saved yet.");
											}
										}),
										/* @__PURE__ */ (0, T.jsx)("output", {
											className: "min-w-16 font-bold text-foreground",
											children: Tt(De)
										})
									]
								}),
								S && /* @__PURE__ */ (0, T.jsx)(v, {
									onClick: () => void mt(),
									children: "Save slides"
								}),
								S && /* @__PURE__ */ (0, T.jsxs)("label", {
									className: x("inline-flex cursor-pointer items-center gap-1.5 rounded-md border bg-background px-3 py-2 text-sm font-semibold hover:border-gold", _t && "pointer-events-none opacity-60"),
									children: ["📄 Add a PDF slide", /* @__PURE__ */ (0, T.jsx)("input", {
										type: "file",
										accept: "application/pdf,.pdf",
										className: "sr-only",
										onChange: (e) => {
											let t = e.target.files?.[0];
											e.target.value = "", yt(t);
										}
									})]
								}),
								/* @__PURE__ */ (0, T.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: _t || ke
								})
							]
						}),
						/* @__PURE__ */ (0, T.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "A PDF slide shows its pages one after another on the board, each for the seconds you set, in its place in this list (up to 40 pages; big PDFs are kept at a lower quality to fit)."
						})
					]
				})
			] }) : /* @__PURE__ */ (0, T.jsx)(H, { n: Y }, Y),
			g
		]
	});
}
export { we as default };
