var e = (e) => {
	let t = Number(e);
	return Number.isFinite(t) ? t : 0;
}, t = (e) => String(e).padStart(2, "0"), n = (e) => `${e.getFullYear()}-${t(e.getMonth() + 1)}-${t(e.getDate())}`, r = (e, t) => {
	let r = /* @__PURE__ */ new Date(`${e}T12:00`);
	return r.setDate(r.getDate() + t), n(r);
}, i = (e, t) => {
	if (!e) return null;
	let n = /* @__PURE__ */ new Date(`${e}T${t && t.length ? t : "00:00"}`);
	return isNaN(n.getTime()) ? null : n.getTime();
}, a = (e, t) => String(e).localeCompare(String(t), void 0, {
	numeric: !0,
	sensitivity: "base"
}), o = (e, t) => t ? Math.round(100 * e / t) : 0, s = (e) => e.reduce((e, t) => e + t, 0);
function c(t, n, o, s, c) {
	let l = o.perRoom !== !1, { from: u, to: d } = o;
	u > d && ([u, d] = [d, u]);
	let f = [];
	for (let e = u; e <= d && f.length < 62; e = r(e, 1)) f.push(e);
	let p = f.map((e) => i(e, "22:00")), m = n.filter((e) => !o.only || e.name === o.only).map((t) => {
		let n = t.rooms.filter((e) => !e.until || e.until > p[0]).map((t) => ({
			...t.until ? { until: t.until } : {},
			no: String(t.room_no).trim(),
			key: c.normRoom(t.room_no),
			floor: String(t.floor || "").trim() || c.floorOf(t.room_no),
			cap: e(t.capacity),
			used: l ? f.map(() => 0) : []
		})).sort((e, t) => a(e.floor, t.floor) || a(e.no, t.no));
		return {
			name: t.name,
			rooms: n,
			byKey: new Map(n.map((e) => [e.key, e])),
			cap: n.reduce((e, t) => e + t.cap, 0),
			capN: p.map((e) => n.reduce((t, n) => t + (!n.until || e < n.until ? n.cap : 0), 0)),
			used: f.map(() => 0),
			unroomed: f.map(() => 0),
			extra: /* @__PURE__ */ new Map()
		};
	}), h = new Map(m.map((e) => [e.name, e])), g = f.map(() => /* @__PURE__ */ new Set());
	for (let n of t) {
		if (n.deleted) continue;
		let t = i(n.checkin_date, n.checkin_time), r = s.slipEnd(n);
		if (!t || !r) continue;
		let a = p.map((e) => t <= e && e < r);
		if (!a.some(Boolean)) continue;
		let o = s.rowsOf(n);
		if (o.length) for (let e of o) {
			if (e.block <= 0) continue;
			let t = h.get(s.normB(e.building));
			if (!t) continue;
			let n = t.byKey.get(c.normRoom(e.room_no));
			if (!n) {
				if (!l) continue;
				let r = c.normRoom(e.room_no);
				n = t.extra.get(r) || {
					no: e.room_no,
					key: r,
					floor: c.floorOf(e.room_no),
					cap: 0,
					used: f.map(() => 0),
					off: !0
				}, t.extra.set(r, n);
			}
			p.forEach((r, i) => {
				if (e.start <= r && r < e.end) {
					if (n.until && r >= n.until) {
						t.unroomed[i] += e.block;
						return;
					}
					l && (n.used[i] += e.block), n.off || (t.used[i] += e.block, g[i].add(`${t.name}|${n.key}`));
				}
			});
		}
		else {
			let t = h.get(s.normB(n.building));
			if (!t) continue;
			let r = e(n.gents) + e(n.ladies) + e(n.children) || e(n.total);
			a.forEach((e, i) => {
				e && (t.unroomed[i] += s.isDelayed(n) ? s.paxAt(n, p[i]).total : r);
			});
		}
	}
	for (let e of m) e.rooms.push(...[...e.extra.values()].sort((e, t) => a(e.no, t.no)));
	return {
		days: f,
		blds: m,
		total: {
			cap: m.reduce((e, t) => e + t.cap, 0),
			capN: f.map((e, t) => m.reduce((e, n) => e + n.capN[t], 0)),
			used: f.map((e, t) => m.reduce((e, n) => e + n.used[t], 0)),
			unroomed: f.map((e, t) => m.reduce((e, n) => e + n.unroomed[t], 0)),
			roomsUsed: g.map((e) => e.size)
		},
		cut: f.length === 62 && f[f.length - 1] < d
	};
}
export { s as a, r as i, e as n, n as o, o as r, c as t };
