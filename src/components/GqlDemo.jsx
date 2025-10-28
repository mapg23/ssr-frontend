import { useEffect, useMemo, useState } from "react";

const GQL = "http://localhost:8080/graphql/auth"; // <- change port if needed

/** ====== Tiny GraphQL helper ====== */
async function gql(query, variables = {}) {
  const res = await fetch(GQL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include", // send/receive httpOnly cookie
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || "GraphQL error");
  }
  return json.data;
}

/** ====== Page ====== */
export default function GqlDemoPro() {
    const [me, setMe] = useState(null);
    const [docs, setDocs] = useState([]);
    const [selected, setSelected] = useState(null);    // { ownerId, index, title, content, ... }
    const [form, setForm] = useState({ title: "", content: "" });
    const [shareEmail, setShareEmail] = useState("");
    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    const mine = useMemo(() => docs.filter(d => d.ownerId === me?.id), [docs, me]);
    const shared = useMemo(() => docs.filter(d => d.ownerId !== me?.id), [docs, me]);

    async function loadMe() {
        const { me } = await gql(`query { me { id email name } }`);
        setMe(me || null);
    }
    async function loadDocs() {
        const { documents } = await gql(`
        query {
            documents { title content index ownerId doc_type allowed_users }
        }`);
        setDocs(documents || []);
    }
    async function loadDoc(id, index) {
        const { document } = await gql(`
        query($id:String!, $i:Int!) {
            document(id:$id, index:$i) { title content index ownerId doc_type allowed_users }
        }`, { id, i: Number(index) });
        if (!document) throw new Error("Doc not found or unauthorized");
        setSelected(document);
        setForm({ title: document.title, content: document.content });
    }

    // Initial load
    useEffect(() => {
        (async () => {
        try {
            setErr(""); setMsg("");
            await loadMe();
            if (me) await loadDocs();
        } catch (e) { setErr(String(e.message || e)); }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // If me changes (after login), load docs
    useEffect(() => {
        if (!me) return;
        loadDocs().catch(e => setErr(String(e.message || e)));
    }, [me]);

    /** ====== Actions ====== */
    async function onLogin(e) {
        e.preventDefault();
        setErr(""); setMsg("");
        try {
        const { login } = await gql(
            `mutation($e:String!, $p:String!){
            login(email:$e,password:$p){ status msg }
            }`, { e: loginForm.email, p: loginForm.password }
        );
        if (login.status !== 200) throw new Error(login.msg || "Login failed");
        await loadMe();
        await loadDocs();
        setMsg("Logged in.");
        } catch (e) { setErr(String(e.message || e)); }
    }

    async function onCreate() {
        setErr(""); setMsg("");
        try {
        const { addDocument } = await gql(
            `mutation($doc:DocumentInput!){
            addDocument(doc:$doc){ status msg }
            }`,
            { doc: { title: "GQL Demo", content: "Hello from GraphQL!" } }
        );
        if (addDocument.status !== 200) throw new Error(addDocument.msg || "Add failed");
        await loadDocs();
        setMsg("Document created.");
        } catch (e) { setErr(String(e.message || e)); }
    }

    async function onSelect(d) {
        setErr(""); setMsg("");
        try { await loadDoc(d.ownerId, d.index); }
        catch (e) { setErr(String(e.message || e)); }
    }

    async function onSave() {
        if (!selected) return;
        setErr(""); setMsg("");
        try {
        const { updateDocument } = await gql(
            `mutation($id:String!, $i:Int!, $t:String!, $c:String!){
            updateDocument(id:$id, index:$i, title:$t, content:$c){ status msg }
            }`,
            { id: selected.ownerId, i: Number(selected.index), t: form.title, c: form.content }
        );
        if (updateDocument.status !== 200) throw new Error(updateDocument.msg || "Update failed");
        await loadDoc(selected.ownerId, selected.index); // refresh
        setMsg("Document updated.");
        } catch (e) { setErr(String(e.message || e)); }
    }

    async function onShare() {
        if (!selected || !shareEmail) return;
        setErr(""); setMsg("");
        try {
        const { shareDocument } = await gql(
            `mutation($id:String!,$i:Int!,$email:String!){
            shareDocument(id:$id,index:$i,email:$email){ status msg }
            }`,
            { id: selected.ownerId, i: Number(selected.index), email: shareEmail }
        );
        if (shareDocument.status !== 200) throw new Error(shareDocument.msg || "Share failed");
        await loadDoc(selected.ownerId, selected.index);
        setShareEmail("");
        setMsg("Document shared.");
        } catch (e) { setErr(String(e.message || e)); }
    }

    return (
        <div style={{ padding: 16, fontFamily: "ui-sans-serif", lineHeight: 1.45 }}>
        <h2>GraphQL Demo (all core operations)</h2>
        <div style={{ marginBottom: 12, opacity: .8 }}>
            Endpoint: <code>{GQL}</code>
        </div>

        {err && <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>Error: {err}</div>}
        {msg && <div style={{ color: "seagreen" }}>{msg}</div>}

        {!me && (
            <form onSubmit={onLogin} style={{ display: "grid", gap: 8, maxWidth: 360, marginTop: 12 }}>
            <b>Login</b>
            <input
                placeholder="email"
                value={loginForm.email}
                onChange={e => setLoginForm(v => ({ ...v, email: e.target.value }))}
            />
            <input
                placeholder="password"
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm(v => ({ ...v, password: e.target.value }))}
            />
            <button type="submit">Login</button>
            <small>Use an existing user from your DB.</small>
            </form>
        )}

        {me && (
            <>
            <div style={{ marginTop: 16 }}>
                <b>me:</b>
                <pre>{JSON.stringify(me, null, 2)}</pre>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button onClick={loadDocs}>Reload documents</button>
                <button onClick={onCreate}>Create demo document</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                <div>
                <h3>My documents</h3>
                <ul>
                    {mine.map(d => (
                    <li key={`${d.ownerId}:${d.index}`} style={{ cursor: "pointer" }} onClick={() => onSelect(d)}>
                        <b>{d.title || "(untitled)"}</b> — idx {d.index}
                    </li>
                    ))}
                </ul>

                <h3>Shared with me</h3>
                <ul>
                    {shared.map(d => (
                    <li key={`${d.ownerId}:${d.index}`} style={{ cursor: "pointer" }} onClick={() => onSelect(d)}>
                        <b>{d.title || "(untitled)"}</b> — idx {d.index} (owner {d.ownerId.slice(0,6)}…)
                    </li>
                    ))}
                </ul>
                </div>

                <div>
                <h3>Selected document</h3>
                {!selected && <div>Select a document to edit.</div>}
                {selected && (
                    <>
                    <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
                        <label>Title
                        <input value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} />
                        </label>
                        <label>Content
                        <textarea rows={8} value={form.content} onChange={e => setForm(v => ({ ...v, content: e.target.value }))} />
                        </label>
                        <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={onSave}>Save (updateDocument)</button>
                        <input
                            placeholder="share to email"
                            value={shareEmail}
                            onChange={e => setShareEmail(e.target.value)}
                        />
                        <button onClick={onShare}>Share</button>
                        </div>
                        <small>
                        ownerId: <code>{selected.ownerId}</code> | index: <code>{String(selected.index)}</code>
                        </small>
                    </div>
                    </>
                )}
                </div>
            </div>
            </>
        )}
        </div>
    );
}
