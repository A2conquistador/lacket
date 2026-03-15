import { useState, useEffect } from "react";
import axios from "axios";

const ROLES = ["Player","BetaTester","VIP","Moderator","Admin","Dev","Owner","God","Creator"];
const ROLE_COLORS = { Player:"#9ca3af", BetaTester:"#06b6d4", VIP:"#f59e0b", Moderator:"#22c55e", Admin:"#3b82f6", Dev:"#ec4899", Owner:"#f43f5e", God:"#a855f7", Creator:"#f97316" };
const ROLE_RANK = { Player:0, BetaTester:1, VIP:2, Moderator:3, Admin:4, Dev:5, Owner:6 };

export default function OwnerPanel({ user }) {
    const [tab, setTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [search, setSearch] = useState("");
    const [tokenUser, setTokenUser] = useState("");
    const [tokenAmount, setTokenAmount] = useState("");
    const [blookUser, setBlookUser] = useState("");
    const [blookName, setBlookName] = useState("");
    const [blookRarity, setBlookRarity] = useState("Common");
    const token = localStorage.getItem("token");
    const h = { authorization: token };

    const load = () => axios.get("/api/admin/users", { headers: h }).then(r => setUsers(r.data)).catch(() => {});
    useEffect(() => { load(); }, []);

    const flash = (m, e) => { if(e) setErr(m); else setMsg(m); setTimeout(() => { setMsg(""); setErr(""); }, 3000); };

    const giveTokens = async () => {
        try { await axios.post("/api/admin/tokens", { username: tokenUser, amount: parseInt(tokenAmount) }, { headers: h }); flash("Tokens given!"); load(); setTokenUser(""); setTokenAmount(""); }
        catch(e) { flash(e.response?.data?.error || "Failed", true); }
    };

    const giveBlook = async () => {
        try { await axios.post("/api/admin/blook", { username: blookUser, blook_name: blookName, rarity: blookRarity }, { headers: h }); flash("Blook given!"); setBlookUser(""); setBlookName(""); }
        catch(e) { flash(e.response?.data?.error || "Failed", true); }
    };

    const toggleBan = async (username, banned) => {
        try { await axios.post("/api/admin/ban", { username, banned: !banned }, { headers: h }); flash((banned?"Un":"")+"banned "+username); load(); }
        catch(e) { flash(e.response?.data?.error || "Failed", true); }
    };

    const setRole = async (username, role) => {
        try { await axios.post("/api/admin/role", { username, role }, { headers: h }); flash("Role updated!"); load(); }
        catch(e) { flash(e.response?.data?.error || "Failed", true); }
    };

    const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

    const stats = {
        total: users.length,
        banned: users.filter(u => u.banned).length,
        active: users.filter(u => !u.banned).length,
        devs: users.filter(u => u.role === "Dev").length,
        owners: users.filter(u => u.role === "Owner").length,
        totalTokens: users.reduce((a, u) => a + (u.tokens || 0), 0),
    };

    const S = {
        card: { background:"linear-gradient(135deg,#0d0a1f,#100820)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:"16px", padding:"24px", marginBottom:"20px" },
        input: { background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:"8px", color:"#fff", fontFamily:"Nunito,sans-serif", fontSize:"14px", padding:"9px 12px", marginRight:"8px", marginBottom:"8px" },
        btn: { background:"linear-gradient(135deg,#f43f5e,#e11d48)", border:"none", borderRadius:"8px", color:"#fff", fontFamily:"Nunito,sans-serif", fontSize:"14px", fontWeight:"700", padding:"9px 18px", cursor:"pointer" },
        btnBlue: { background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:"8px", color:"#fff", fontFamily:"Nunito,sans-serif", fontSize:"14px", fontWeight:"700", padding:"9px 18px", cursor:"pointer" },
        tabBtn: (active) => ({ padding:"10px 20px", background: active ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:"8px", color: active ? "#fff" : "rgba(255,255,255,0.5)", fontFamily:"Nunito,sans-serif", fontSize:"13px", fontWeight:"700", cursor:"pointer", marginRight:"8px" }),
    };

    return (
        <div style={{maxWidth:"1000px"}}>
            <style>{"@keyframes ownerGlow { 0%,100%{text-shadow:0 0 20px rgba(244,63,94,0.5)} 50%{text-shadow:0 0 40px rgba(244,63,94,0.9)} }"}</style>

            <div style={{marginBottom:"28px"}}>
                <h1 style={{fontFamily:"Titan One,sans-serif",fontSize:"36px",margin:"0 0 4px",color:"#f43f5e",animation:"ownerGlow 3s ease-in-out infinite"}}>👑 Owner Panel</h1>
                <p style={{margin:0,color:"rgba(255,255,255,0.4)",fontSize:"14px"}}>Full server control — use with care</p>
            </div>

            {msg && <div style={{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:"10px",padding:"12px 16px",color:"#86efac",marginBottom:"16px"}}>{msg}</div>}
            {err && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"10px",padding:"12px 16px",color:"#f87171",marginBottom:"16px"}}>{err}</div>}

            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"12px",marginBottom:"24px"}}>
                {[
                    {label:"Total Users",value:stats.total,color:"#a5b4fc"},
                    {label:"Active",value:stats.active,color:"#86efac"},
                    {label:"Banned",value:stats.banned,color:"#f87171"},
                    {label:"Devs",value:stats.devs,color:"#ec4899"},
                    {label:"Owners",value:stats.owners,color:"#f43f5e"},
                    {label:"Total Tokens",value:stats.totalTokens.toLocaleString(),color:"#f59e0b"},
                ].map((s,i) => (
                    <div key={i} style={{background:"rgba(244,63,94,0.06)",border:"1px solid rgba(244,63,94,0.15)",borderRadius:"12px",padding:"14px",textAlign:"center"}}>
                        <div style={{fontSize:"20px",fontWeight:"900",color:s.color}}>{s.value}</div>
                        <div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",textTransform:"uppercase",fontWeight:"700",marginTop:"4px"}}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{marginBottom:"20px"}}>
                {["users","tools","danger"].map(t => (
                    <button key={t} style={S.tabBtn(tab===t)} onClick={()=>setTab(t)}>
                        {t==="users"?"👥 Users":t==="tools"?"🔧 Tools":"⚠️ Danger Zone"}
                    </button>
                ))}
            </div>

            {tab==="users" && (
                <div style={S.card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                        <div style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",textTransform:"uppercase",fontWeight:"700"}}>All Users ({filteredUsers.length})</div>
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." style={{...S.input,marginBottom:0,marginRight:0,width:"200px"}} />
                    </div>
                    <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:"14px"}}>
                            <thead>
                                <tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                                    {["ID","Username","Tokens","Role","Status","Actions"].map(h=>(
                                        <th key={h} style={{padding:"8px 12px",textAlign:"left",color:"rgba(255,255,255,0.4)",fontWeight:"700",fontSize:"12px",textTransform:"uppercase"}}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                                        <td style={{padding:"10px 12px",color:"rgba(255,255,255,0.3)"}}>{u.id}</td>
                                        <td style={{padding:"10px 12px",fontWeight:"700",color:"#e0e7ff"}}>{u.username}</td>
                                        <td style={{padding:"10px 12px",color:"#f59e0b"}}>{u.tokens?.toLocaleString()}</td>
                                        <td style={{padding:"10px 12px"}}>
                                            <select value={u.role||"Player"} onChange={e=>setRole(u.username,e.target.value)} style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:"6px",color:ROLE_COLORS[u.role]||"#9ca3af",fontSize:"12px",padding:"4px 8px",cursor:"pointer"}}>
                                                {ROLES.map(r=><option key={r} value={r} style={{color:"#fff",background:"#0d1240"}}>{r}</option>)}
                                            </select>
                                        </td>
                                        <td style={{padding:"10px 12px"}}>
                                            <span style={{background:u.banned?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.1)",border:"1px solid "+(u.banned?"rgba(239,68,68,0.3)":"rgba(34,197,94,0.3)"),borderRadius:"6px",padding:"3px 8px",fontSize:"12px",color:u.banned?"#f87171":"#86efac"}}>{u.banned?"Banned":"Active"}</span>
                                        </td>
                                        <td style={{padding:"10px 12px"}}>
                                            {u.username !== user.username && <button onClick={()=>toggleBan(u.username,u.banned)} style={{background:u.banned?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",border:"1px solid "+(u.banned?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"),borderRadius:"6px",color:u.banned?"#86efac":"#f87171",fontSize:"12px",fontWeight:"700",padding:"4px 10px",cursor:"pointer"}}>{u.banned?"Unban":"Ban"}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab==="tools" && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
                    <div style={S.card}>
                        <div style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"12px",fontWeight:"700"}}>💰 Give Tokens</div>
                        <input style={S.input} placeholder="Username" value={tokenUser} onChange={e=>setTokenUser(e.target.value)} />
                        <input style={{...S.input,width:"100px"}} placeholder="Amount" type="number" value={tokenAmount} onChange={e=>setTokenAmount(e.target.value)} />
                        <button style={S.btn} onClick={giveTokens}>Give</button>
                    </div>
                    <div style={S.card}>
                        <div style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"12px",fontWeight:"700"}}>🃏 Give Blook</div>
                        <input style={S.input} placeholder="Username" value={blookUser} onChange={e=>setBlookUser(e.target.value)} />
                        <input style={S.input} placeholder="Blook name" value={blookName} onChange={e=>setBlookName(e.target.value)} />
                        <select value={blookRarity} onChange={e=>setBlookRarity(e.target.value)} style={{...S.input,marginRight:"8px"}}>
                            {["Common","Uncommon","Rare","Epic","Legendary","Mythic","Chroma","Dev"].map(r=><option key={r} value={r}>{r}</option>)}
                        </select>
                        <button style={S.btn} onClick={giveBlook}>Give</button>
                    </div>
                    <div style={S.card}>
                        <div style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"12px",fontWeight:"700"}}>📊 Server Info</div>
                        <div style={{fontSize:"13px",color:"rgba(255,255,255,0.6)",lineHeight:"2"}}>
                            <div>👥 Total users: <strong style={{color:"#e0e7ff"}}>{stats.total}</strong></div>
                            <div>🪙 Tokens in circulation: <strong style={{color:"#f59e0b"}}>{stats.totalTokens.toLocaleString()}</strong></div>
                            <div>🚫 Banned accounts: <strong style={{color:"#f87171"}}>{stats.banned}</strong></div>
                            <div>🛠️ Staff members: <strong style={{color:"#ec4899"}}>{users.filter(u=>ROLE_RANK[u.role]>=3).length}</strong></div>
                        </div>
                    </div>
                </div>
            )}

            {tab==="danger" && (
                <div style={S.card}>
                    <div style={{fontSize:"13px",color:"#f87171",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"20px",fontWeight:"700"}}>⚠️ Danger Zone — These actions are irreversible</div>
                    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                        {[
                            {title:"Ban All Non-Staff", desc:"Bans all Player-role accounts"},
                            {title:"Reset All Tokens", desc:"Sets every user tokens to 0"},
                            {title:"Wipe All Blooks", desc:"Deletes every blook from every user"},
                        ].map((item,i) => (
                            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(239,68,68,0.05)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"12px",padding:"16px 20px"}}>
                                <div>
                                    <div style={{fontWeight:"700",color:"#e0e7ff",marginBottom:"4px"}}>{item.title}</div>
                                    <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)"}}>{item.desc}</div>
                                </div>
                                <button onClick={()=>flash("Not yet implemented",true)} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:"8px",color:"#f87171",fontFamily:"Nunito,sans-serif",fontSize:"13px",fontWeight:"700",padding:"8px 16px",cursor:"pointer"}}>Execute</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
