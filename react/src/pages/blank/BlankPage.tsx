import { Card, CardContent } from '@/components/ui/card';
import { useCore, useNav } from '@/pms/PmsContext';

// Shown to a login that may open no page at all (Setup → Page access has nothing ticked for it).
export default function BlankPage() {
    const { cloud } = useCore();
    const { href } = useNav();
    return (
        <div className="mx-auto max-w-xl px-4 py-12">
            <Card className="text-center">
                <CardContent className="grid gap-3 py-8">
                    <div className="text-5xl" aria-hidden="true">🔒</div>
                    <h1 className="text-xl font-bold text-primary">No pages are open for this login yet</h1>
                    <p>Logged in as {cloud.currentDesk()?.name || ''}.</p>
                    <p className="text-muted-foreground">
                        Ask the admin to tick the pages you need (Setup → Page access). You can still change your password in{' '}
                        <a className="font-semibold text-primary underline" href={href('settings')}>Settings</a>.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
