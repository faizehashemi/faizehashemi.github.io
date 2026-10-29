import { useEffect, useMemo, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/PageHeader';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePrompt } from '@/components/PromptDialog';
import { useCore, useGuard, useLoadCore, useSite } from '@/pms/PmsContext';
import { BillDialog, EditBillDialog, ItemFormDialog, StaffFormDialog, StaffHistoryDialog } from './dialogs';
import { LaProvider, type LaCtx } from './la';
import { makeDates, type Libs } from './ladmin';
import { BillsTab, BuildingTab, FreeTab, NoticeTab, PaymentsTab, PricesTab, ReportsTab, StaffTab } from './tabs';

// Laundry admin (PC): cash bills (from → to; mark Paid one by one, by selection or by the amount the worker handed over), the payments log, reports, staff-only
// laundry, building linen, prices (clothes and building linen, with pictures), staff profiles (photo, limits, categories) and the laundry notice. Admin logins
// change things; desk logins may mark cash paid; the rest only look. Exports: Excel and PDF. The money / receipt helpers are core/laundry.js.

type Row = Record<string, any>;
const TABS: [string, string][] = [['bills', '🧾 Bills'], ['payments', '💰 Payments'], ['reports', '📈 Reports'], ['free', '👷 Staff only'], ['building', '🏨 Building'], ['prices', '🏷️ Prices'], ['staff', '👤 Staff'], ['notice', '📝 Notice & log']];

export default function LaundryAdminPage() {
    const { cloud } = useCore();
    const guard = useGuard();
    const loadCore = useLoadCore();
    const { site, siteId } = useSite();
    const { ask: confirm, dialog: confirmDialog } = useConfirm();
    const { ask: prompt, dialog: promptDialog } = usePrompt();
    const me = cloud.currentDesk();
    const isAdmin = me?.role === 'admin', canPay = isAdmin || me?.role === 'desk';   // a desk login may mark its site's cash bills paid; the rest stays admin-only

    const [mods, setMods] = useState<{ laundry: any; lib: any } | null>(null);
    const [tab, setTab] = useState('bills');
    const [items, setItems] = useState<Row[]>([]), [staff, setStaff] = useState<Row[]>([]), [cats, setCats] = useState<string[]>([]), [info, setInfo] = useState('');
    const [bill, setBill] = useState<Row | null>(null), [editing, setEditing] = useState<Row | null>(null), [histId, setHistId] = useState<number | null>(null);
    const [itemForm, setItemForm] = useState<{ open: boolean; item: Row | null }>({ open: false, item: null});
    const [staffForm, setStaffForm] = useState<{ open: boolean; row: Row | null }>({ open: false, row: null });
    const [epoch, setEpoch] = useState(0);
    const billIndex = useRef(new Map<number, Row>());

    const api = (m: string, p: string, b?: unknown) => guard((cloud as any).request(m, p, b)) as Promise<any>;
    useEffect(() => {
        void (async () => {
            const [laundry, lib] = await Promise.all([loadCore('laundry'), loadCore('lib')]);
            setMods({ laundry, lib });
            // the receipt styles for the bill dialog (core/laundry.js RECEIPT_CSS), added while this page is open
            const st = document.createElement('style'); st.dataset.laundryReceipt = '1'; st.textContent = laundry.RECEIPT_CSS; document.head.appendChild(st);
            try { const r = await api('GET', '/api/settings'); setInfo(r.settings.laundry_info || laundry.DEFAULT_INFO); setCats(r.settings.laundry_staff_categories?.[siteId] || []); } catch { setInfo(laundry.DEFAULT_INFO); }
            await Promise.all([loadItems(), loadStaff()]).catch(() => { /* ignore */ });
        })();
        return () => { document.querySelectorAll('style[data-laundry-receipt]').forEach(e => e.remove()); };
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    const loadItems = async () => setItems((await api('GET', `/api/laundry/items?site=${siteId}`)).items);
    // deleted profiles come too: their photos still show in the register and histories, never in the Staff list
    const loadStaff = async () => setStaff((await api('GET', `/api/laundry/staff?site=${siteId}&deleted=1`)).staff);

    const dates = useMemo(() => (mods ? makeDates(mods.laundry.jeddahDay) : null), [mods]);
    if (!mods || !dates) return <div className="mx-auto max-w-[2400px] p-4 text-sm text-muted-foreground">Loading…</div>;
    const libs = { ...mods.laundry, laundry: mods.laundry, lib: mods.lib, addDays: dates.addDays, info } as Libs & Row;

    const ctx: LaCtx = {
        site: siteId, isAdmin, canPay, libs, api, items, staff, cats, info, setItems, setStaff, setCats, setInfo, loadItems, loadStaff,
        openBill: b => setBill(billIndex.current.get(b.id) || b), openStaffHistory: setHistId, openStaffForm: row => setStaffForm({ open: true, row }), openItemForm: item => setItemForm({ open: true, item }),
        indexBills: list => { for (const b of list) billIndex.current.set(b.id, b); }, billIndex, fmtDay: dates.fmtDay, presets: dates.presets, confirm, prompt, refresh: () => setEpoch(e => e + 1),
    };
    return (
        <LaProvider value={ctx}>
            <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
                <PageHeader view="laundry-admin" title="Laundry admin" current={TABS.find(t => t[0] === tab)?.[1].replace(/^\S+\s/, '')}>
                    <span className="text-sm text-muted-foreground">{site.label} · {isAdmin ? 'admin' : canPay ? 'desk · can mark cash paid' : 'view only'}</span></PageHeader>
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList variant="underline">{TABS.map(([k, l]) => <TabsTrigger key={k} value={k}>{l}</TabsTrigger>)}</TabsList>
                    <TabsContent key={`bills-${epoch}`} value="bills"><BillsTab /></TabsContent>
                    <TabsContent key={`payments-${epoch}`} value="payments"><PaymentsTab /></TabsContent>
                    <TabsContent key={`reports-${epoch}`} value="reports"><ReportsTab /></TabsContent>
                    <TabsContent key={`free-${epoch}`} value="free"><FreeTab /></TabsContent>
                    <TabsContent key={`building-${epoch}`} value="building"><BuildingTab /></TabsContent>
                    <TabsContent key={`prices-${epoch}`} value="prices"><PricesTab /></TabsContent>
                    <TabsContent key={`staff-${epoch}`} value="staff"><StaffTab /></TabsContent>
                    <TabsContent key={`notice-${epoch}`} value="notice"><NoticeTab /></TabsContent>
                </Tabs>
            </div>
            <BillDialog bill={bill} onClose={() => setBill(null)} onEdit={b => { setBill(null); setEditing(b); }} onChanged={ctx.refresh} />
            <EditBillDialog bill={editing} onClose={() => setEditing(null)} onSaved={b => { setEditing(null); ctx.refresh(); setBill(b); }} />
            <StaffHistoryDialog id={histId} onClose={() => setHistId(null)} onBill={b => { setHistId(null); setBill(b); }} />
            <ItemFormDialog item={itemForm.item} open={itemForm.open} onClose={() => { setItemForm(f => ({ ...f, open: false })); ctx.refresh(); }} />
            <StaffFormDialog staffRow={staffForm.row} open={staffForm.open} onClose={() => { setStaffForm(f => ({ ...f, open: false })); ctx.refresh(); }} />
            {confirmDialog}{promptDialog}
        </LaProvider>
    );
}
