import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, BookOpen, FlaskConical, Layers } from "lucide-react";
import { useLabTemplates } from "@/hooks/useLaboratory";

export default function TestTemplates() {
  const { data: templates = [], isLoading } = useLabTemplates();
  const [search, setSearch] = useState("");

  const filteredTemplates = useMemo(() => {
    if (!search) return templates;
    const lower = search.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        t.code.toLowerCase().includes(lower) ||
        t.specimenType.toLowerCase().includes(lower)
    );
  }, [templates, search]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Laboratory Test Catalog & Diagnostic Profiles
          </h1>
          <p className="text-muted-foreground text-sm">
            Standard operating procedure panels, biological reference intervals, and specimen protocols
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search panels or codes..."
            className="pl-9 h-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-xs">Loading laboratory catalog templates...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((t) => (
            <Card key={t.code} className="shadow-card border-border">
              <CardHeader className="p-4 pb-3 border-b bg-muted/30">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-heading font-bold flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-primary" />
                      {t.name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Specimen: <span className="font-semibold text-foreground">{t.specimenType}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs bg-primary/5 text-primary border-primary/20">
                    {t.code}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide h-8">Analyte Parameter</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide h-8">Biological Reference</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide h-8 text-right">System Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {t.parameters.map((p) => (
                      <TableRow key={p.key} className="hover:bg-accent/30">
                        <TableCell className="py-2 text-xs font-medium text-foreground">
                          {p.label}
                        </TableCell>
                        <TableCell className="py-2 text-xs font-mono text-muted-foreground">
                          {p.ref || "Qualitative"}
                        </TableCell>
                        <TableCell className="py-2 text-xs font-mono text-right text-muted-foreground/80">
                          {p.key}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
