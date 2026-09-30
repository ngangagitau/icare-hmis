import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  FlaskConical,
  CheckCircle2,
  Clock,
  Loader2,
  Barcode,
  Printer,
  FileEdit,
  TestTube,
  AlertTriangle,
  Info,
  Check,
} from "lucide-react";
import { useCollectLabSample, useLabTests, useLabStats } from "@/hooks/useLaboratory";
import { toast } from "sonner";
import type { LabTest } from "@/lib/laboratoryService";

const tubeGuides = [
  { name: "EDTA (Lavender)", color: "bg-purple-600 text-white", tests: "CBC, HbA1c, Blood Group, ESR" },
  { name: "SST / Serum (Gold/Red)", color: "bg-amber-500 text-white", tests: "LFTs, RFTs, Lipid, Electrolytes, Serology" },
  { name: "Citrate (Light Blue)", color: "bg-sky-500 text-white", tests: "PT/INR, PTT, Coagulation Studies" },
  { name: "Fluoride (Grey)", color: "bg-slate-400 text-slate-900", tests: "Fasting Blood Sugar, OGTT, Lactate" },
  { name: "Sterile Container", color: "bg-emerald-600 text-white", tests: "Urinalysis, Stool, Sputum, Body Fluids" },
];

export default function SampleCollection() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const patientFilter = params.get("patient") || undefined;
  const queueEntryId = params.get("queueEntry") || undefined;

  const { data, isLoading, isError, error } = useLabTests(1, 100, {
    patient: patientFilter,
    queueEntryId,
  });
  const { data: stats } = useLabStats();
  const collectSample = useCollectLabSample();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "collected" | "completed">("all");

  // Collection modal state
  const [collectingOrder, setCollectingOrder] = useState<LabTest | null>(null);
  const [collectionSite, setCollectionSite] = useState("Left Ante-cubital Fossa");
  const [specimenCondition, setSpecimenCondition] = useState("Adequate");
  const [collectionNotes, setCollectionNotes] = useState("");

  // Barcode print modal
  const [barcodeOrder, setBarcodeOrder] = useState<LabTest | null>(null);

  const samples = data?.data || [];

  const filteredSamples = useMemo(() => {
    let result = samples;
    if (activeTab === "pending") {
      result = result.filter((s) => s.status === "Pending");
    } else if (activeTab === "collected") {
      result = result.filter((s) => s.status === "Sample Received" || s.status === "Processing");
    } else if (activeTab === "completed") {
      result = result.filter((s) => s.status === "Completed");
    }

    if (!search) return result;
    const lowerSearch = search.toLowerCase();
    return result.filter(
      (s) =>
        (s.patientName || "").toLowerCase().includes(lowerSearch) ||
        (s.patientDisplayId || "").toLowerCase().includes(lowerSearch) ||
        (s.orderNumber || "").toLowerCase().includes(lowerSearch) ||
        (s.testName || "").toLowerCase().includes(lowerSearch) ||
        (s.specimenType || "").toLowerCase().includes(lowerSearch)
    );
  }, [samples, search, activeTab]);

  const pendingCount = stats?.pending ?? samples.filter((s) => s.status === "Pending").length;
  const collectedCount = stats?.collected ?? samples.filter((s) => s.status === "Sample Received").length;
  const processingCount = stats?.processing ?? samples.filter((s) => s.status === "Processing").length;
  const completedCount = stats?.completed ?? samples.filter((s) => s.status === "Completed").length;

  const handleOpenCollect = (order: LabTest) => {
    setCollectingOrder(order);
    setCollectionSite("Left Ante-cubital Fossa");
    setSpecimenCondition("Adequate");
    setCollectionNotes("");
  };

  const handleConfirmCollect = async () => {
    if (!collectingOrder) return;
    try {
      await collectSample.mutateAsync({
        id: collectingOrder._id,
        specimenCondition,
        notes: `Site: ${collectionSite}. ${collectionNotes}`.trim(),
      });
      toast.success(`Sample collected for ${collectingOrder.testName}`);
      const justCollected = collectingOrder;
      setCollectingOrder(null);
      // Offer barcode print right away
      setBarcodeOrder(justCollected);
    } catch (err: any) {
      toast.error(err?.message || "Failed to confirm sample collection");
    }
  };

  const handlePrintBarcode = (order: LabTest) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Specimen Barcode - ${order.orderNumber}</title>
          <style>
            @page { size: 50mm 30mm; margin: 2mm; }
            body { font-family: monospace; margin: 0; padding: 2px; text-align: center; font-size: 10px; }
            .order { font-size: 11px; font-weight: bold; letter-spacing: 1px; }
            .name { font-size: 10px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .bar { display: inline-block; width: 100%; height: 26px; background: repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 7px, #fff 7px, #fff 9px); margin: 3px 0; }
            .details { font-size: 8px; display: flex; justify-content: space-between; padding: 0 4px; }
          </style>
        </head>
        <body>
          <div class="name">${order.patientName || "PATIENT"} (${order.patientDisplayId || "P-ID"})</div>
          <div class="order">${order.orderNumber}</div>
          <div class="bar"></div>
          <div class="details">
            <span>${order.testCode || order.testName?.slice(0, 10)}</span>
            <span>${order.specimenType || "Blood"}</span>
            <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </body>
      </html>
    `;
    const w = window.open("", "_blank", "width=300,height=200");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <TestTube className="h-6 w-6 text-primary" />
            Phlebotomy & Sample Collection Station
          </h1>
          <p className="text-muted-foreground text-sm">
            Accession samples, verify collection tubes, print barcode labels, and route specimens
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/laboratory/results")}>
            <FileEdit className="h-4 w-4 mr-1.5 text-primary" />
            Go to Results Entry
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center text-warning font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Pending Phlebotomy</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{collectedCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Accessioned & Received</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/30 bg-indigo-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-600">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{processingCount}</p>
              <p className="text-xs text-muted-foreground font-medium">In Diagnostic Bench</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{completedCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Finalized & Released</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tube Guide Panel */}
      <Card className="border-border">
        <CardHeader className="py-3 px-4 bg-muted/40">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Info className="h-4 w-4 text-primary" />
            Vacutainer Color Coding & Specimen Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {tubeGuides.map((tube) => (
              <div key={tube.name} className="p-2.5 rounded-lg border bg-card text-card-foreground text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <span className={`w-3.5 h-3.5 rounded-full inline-block shadow-sm ${tube.color}`} />
                  <span>{tube.name}</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{tube.tests}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Worklist Table */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setActiveTab("all")}
              >
                All Specimens ({samples.length})
              </Button>
              <Button
                variant={activeTab === "pending" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setActiveTab("pending")}
              >
                To Collect ({pendingCount})
              </Button>
              <Button
                variant={activeTab === "collected" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setActiveTab("collected")}
              >
                In Lab ({collectedCount + processingCount})
              </Button>
              <Button
                variant={activeTab === "completed" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setActiveTab("completed")}
              >
                Released ({completedCount})
              </Button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, order, test..."
                className="pl-9 h-8 text-xs w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading laboratory specimen worklist...</span>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-destructive">{(error as Error)?.message || "Failed to load samples"}</div>
          ) : filteredSamples.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <FlaskConical className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm font-medium">No laboratory specimens matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Accession #</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Patient</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Test Ordered</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Specimen / Tube</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Payment</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSamples.map((s) => (
                    <TableRow key={s._id} className="group hover:bg-accent/40 transition-colors">
                      <TableCell className="font-mono text-xs font-bold py-3 text-primary">
                        {s.orderNumber}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="font-semibold text-sm text-foreground">{s.patientName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{s.patientDisplayId}</div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-sm font-medium text-foreground">{s.testName}</div>
                        {s.testCode && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5">{s.testCode}</Badge>}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary/70 shrink-0" />
                          <span>{s.specimenType || "Blood / Serum"}</span>
                        </div>
                        {s.collectionTime && (
                          <div className="text-[11px] text-muted-foreground">
                            Collected: {new Date(s.collectionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        {s.paymentStatus === "Awaiting Cashier Payment" ? (
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Unpaid (Cashier)
                          </Badge>
                        ) : s.paymentStatus === "Awaiting Insurance Approval" ? (
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Awaiting Auth
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-semibold bg-success/10 text-success border-success/30 flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Cleared
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${
                            s.status === "Pending"
                              ? "bg-warning/10 text-warning border-warning/30"
                              : s.status === "Sample Received"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                              : s.status === "Processing"
                              ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/30"
                              : "bg-success/10 text-success border-success/30"
                          }`}
                        >
                          {s.status === "Sample Received" ? "Collected" : s.status === "Processing" ? "Testing" : s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status === "Pending" && (
                            s.paymentStatus === "Awaiting Cashier Payment" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="h-8 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30 cursor-not-allowed opacity-90"
                                title="Patient must pay at Cashier Desk before specimen collection"
                              >
                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                Pay at Cashier
                              </Button>
                            ) : s.paymentStatus === "Awaiting Insurance Approval" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="h-8 text-xs text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/30 cursor-not-allowed opacity-90"
                                title="Cashier must approve insurance pre-authorization before specimen collection"
                              >
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                Awaiting Auth
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-primary text-primary-foreground shadow-sm"
                                onClick={() => handleOpenCollect(s)}
                              >
                                <TestTube className="h-3.5 w-3.5 mr-1" />
                                Collect Specimen
                              </Button>
                            )
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs px-2.5"
                            title="Print Specimen Barcode Label"
                            onClick={() => handlePrintBarcode(s)}
                          >
                            <Barcode className="h-3.5 w-3.5" />
                          </Button>

                          {s.status !== "Pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-primary border-primary/30 hover:bg-primary/5"
                              onClick={() => navigate(`/laboratory/results?order=${s._id}`)}
                            >
                              <FileEdit className="h-3.5 w-3.5 mr-1" />
                              Results
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collect Specimen Modal */}
      <Dialog open={!!collectingOrder} onOpenChange={(open) => !open && setCollectingOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Confirm Specimen Collection
            </DialogTitle>
            <DialogDescription>
              Verify patient identity, tube type, and specimen adequacy before accessioning.
            </DialogDescription>
          </DialogHeader>

          {collectingOrder && (
            <div className="space-y-4 py-2 text-sm">
              <div className="p-3 rounded-lg bg-muted/60 space-y-1">
                <div className="font-semibold text-foreground text-sm flex justify-between">
                  <span>{collectingOrder.patientName}</span>
                  <span className="font-mono text-xs text-muted-foreground">{collectingOrder.patientDisplayId}</span>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Test: <strong>{collectingOrder.testName}</strong></span>
                  <span className="font-mono">{collectingOrder.orderNumber}</span>
                </div>
                <div className="text-xs text-primary font-medium">
                  Specimen Type: {collectingOrder.specimenType || "Blood"}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site" className="text-xs">Anatomical Collection Site</Label>
                <Select value={collectionSite} onValueChange={setCollectionSite}>
                  <SelectTrigger id="site" className="h-9">
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Left Ante-cubital Fossa">Left Ante-cubital Fossa</SelectItem>
                    <SelectItem value="Right Ante-cubital Fossa">Right Ante-cubital Fossa</SelectItem>
                    <SelectItem value="Dorsal Hand Vein">Dorsal Hand Vein</SelectItem>
                    <SelectItem value="Clean Catch Midstream (Urine)">Clean Catch Midstream (Urine)</SelectItem>
                    <SelectItem value="Fingerstick Capillary">Fingerstick Capillary</SelectItem>
                    <SelectItem value="Throat / Nasal Swab">Throat / Nasal Swab</SelectItem>
                    <SelectItem value="Other Site">Other Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition" className="text-xs">Specimen Condition</Label>
                <Select value={specimenCondition} onValueChange={setSpecimenCondition}>
                  <SelectTrigger id="condition" className="h-9">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adequate">Adequate (Clear / Good volume)</SelectItem>
                    <SelectItem value="Slightly Hemolyzed">Slightly Hemolyzed</SelectItem>
                    <SelectItem value="Lipemic">Lipemic</SelectItem>
                    <SelectItem value="Icteric">Icteric</SelectItem>
                    <SelectItem value="Insufficient Volume (QNS)">Insufficient Volume (QNS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs">Phlebotomist Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="e.g. Fasting confirmed, single draw attempt"
                  className="h-9 text-xs"
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setCollectingOrder(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmCollect}
              disabled={collectSample.isPending}
              className="bg-primary"
            >
              {collectSample.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Accessioning...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Accession & Print Barcode
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Quick Preview Modal */}
      <Dialog open={!!barcodeOrder} onOpenChange={(open) => !open && setBarcodeOrder(null)}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Specimen Barcode Ready</DialogTitle>
            <DialogDescription className="text-xs">
              Specimen successfully collected and registered. Send label to thermal printer.
            </DialogDescription>
          </DialogHeader>

          {barcodeOrder && (
            <div className="my-4 p-4 border rounded-lg bg-card shadow-sm inline-block mx-auto w-64 text-left font-mono">
              <div className="text-[11px] font-bold truncate">{barcodeOrder.patientName}</div>
              <div className="text-[10px] text-muted-foreground">{barcodeOrder.patientDisplayId}</div>
              <div className="text-xs font-black tracking-wider my-1 text-primary">{barcodeOrder.orderNumber}</div>
              {/* Simulated barcode bars */}
              <div className="h-8 bg-foreground/90 my-2 rounded-xs opacity-90 flex items-center justify-around px-1">
                <div className="w-1 h-full bg-background" />
                <div className="w-2 h-full bg-background" />
                <div className="w-0.5 h-full bg-background" />
                <div className="w-3 h-full bg-background" />
                <div className="w-1 h-full bg-background" />
                <div className="w-2 h-full bg-background" />
              </div>
              <div className="text-[9px] text-muted-foreground flex justify-between">
                <span>{barcodeOrder.testCode || barcodeOrder.testName?.slice(0, 10)}</span>
                <span>{barcodeOrder.specimenType || "Blood"}</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setBarcodeOrder(null)}>
              Done
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (barcodeOrder) handlePrintBarcode(barcodeOrder);
                setBarcodeOrder(null);
              }}
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print Label (50x30mm)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
