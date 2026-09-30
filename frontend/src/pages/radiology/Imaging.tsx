import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ScanLine,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Maximize2,
  Grid,
  Ruler,
  Eye,
  Sliders,
  Play,
  CheckCircle2,
  Printer,
  FileText,
  RefreshCw,
  Camera,
  Layers,
} from "lucide-react";
import { useRadiologyOrders, useStartRadiologyExam } from "@/hooks/useRadiology";
import type { RadiologyOrder } from "@/lib/radiologyService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SAMPLE_SCANS = [
  {
    modality: "X-Ray",
    title: "Chest PA View - Normal Study",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80",
    tags: { kvp: "120 kV", mas: "4.5 mAs", slice: "Single Projection", matrix: "2048 x 2048" },
  },
  {
    modality: "CT Scan",
    title: "Axial Brain CT - Non-Contrast",
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80",
    tags: { kvp: "130 kV", mas: "220 mAs", slice: "2.5 mm", matrix: "512 x 512" },
  },
  {
    modality: "Ultrasound",
    title: "Abdominal / Hepatobiliary Ultrasound",
    url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80",
    tags: { freq: "3.5 MHz", depth: "18 cm", gain: "64 dB", focus: "Dual Zone" },
  },
  {
    modality: "MRI",
    title: "Sagittal Lumbar Spine T2 Weighted",
    url: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1000&q=80",
    tags: { field: "1.5 Tesla", tr: "3800 ms", te: "105 ms", slice: "4.0 mm" },
  },
];

export default function RadiologyImaging() {
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("All");

  const { data: ordersData, isLoading, refetch } = useRadiologyOrders(1, 100);
  const startExamMutation = useStartRadiologyExam();

  const orders = ordersData?.data || [];

  // PACS Viewer Controls State
  const [selectedScanIdx, setSelectedScanIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [activeTool, setActiveTool] = useState<"pan" | "ruler" | "window">("pan");

  const activeScan = SAMPLE_SCANS[selectedScanIdx] || SAMPLE_SCANS[0];

  const handleResetViewer = () => {
    setZoomLevel(1);
    setBrightness(100);
    setContrast(100);
    setInvert(false);
    setRotation(0);
    setShowGrid(false);
  };

  const handleStartExam = async (order: RadiologyOrder) => {
    if (!order.id) return;
    try {
      await startExamMutation.mutateAsync({
        id: order.id,
        technicianName: "Radiographer On Duty",
      });
      toast.success(`Exam started for ${order.patientName}! Ready for image acquisition.`);
      refetch();
    } catch (err: any) {
      toast.error("Failed to start exam", { description: err.message });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">PACS Digital Imaging Studio</h1>
          <p className="text-xs text-muted-foreground">
            DICOM Modality Worklist (MWL), image acquisition console & interactive radiology workstation
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs h-9">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Worklist
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Modality Worklist (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Active Worklist</CardTitle>
                <Badge variant="outline" className="text-xs font-mono">
                  {orders.length} studies
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Scheduled imaging examinations ready for acquisition
              </CardDescription>

              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter patient or exam..."
                  className="pl-9 text-xs h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[520px] overflow-y-auto pt-0">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Loading modality worklist...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No pending studies in queue.
                </div>
              ) : (
                orders
                  .filter((o) =>
                    `${o.patientName} ${o.orderNumber} ${o.modality} ${o.bodyPart}`
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  )
                  .map((o) => (
                    <div
                      key={o.id || o._id}
                      className={cn(
                        "p-3 rounded-lg border transition-all space-y-2",
                        o.status === "In Progress"
                          ? "border-blue-500/40 bg-blue-500/5 shadow-sm"
                          : "border-border hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {o.orderNumber || o.orderId}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            o.status === "In Progress"
                              ? "bg-blue-500/10 text-blue-700 border-blue-200"
                              : o.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                              : "bg-amber-500/10 text-amber-700 border-amber-200"
                          )}
                        >
                          {o.status}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-foreground">{o.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.patientDisplayId} · <span className="font-medium text-foreground">{o.modality} - {o.bodyPart}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {o.urgency || "Routine"}
                        </span>
                        {o.status === "Pending" ? (
                          <Button
                            size="sm"
                            className="h-6 text-[11px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white gap-1"
                            onClick={() => handleStartExam(o)}
                          >
                            <Play className="h-3 w-3" /> Acquire
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[11px] px-2"
                            onClick={() => {
                              const matchIdx = SAMPLE_SCANS.findIndex(s => s.modality.toLowerCase().includes(o.modality.toLowerCase()));
                              if (matchIdx !== -1) setSelectedScanIdx(matchIdx);
                              toast.info(`Loaded ${o.modality} study into PACS viewer`);
                            }}
                          >
                            Load in PACS
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Full Interactive PACS Viewer Studio (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border shadow-md bg-card">
            {/* Viewer Toolbar */}
            <CardHeader className="py-2.5 px-4 border-b border-border bg-muted/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Select
                    value={String(selectedScanIdx)}
                    onValueChange={(v) => setSelectedScanIdx(Number(v))}
                  >
                    <SelectTrigger className="w-64 h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMPLE_SCANS.map((s, idx) => (
                        <SelectItem key={idx} value={String(idx)}>
                          {s.modality}: {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Badge variant="outline" className="text-[10px] font-mono">
                    {activeScan.modality}
                  </Badge>
                </div>

                {/* DICOM Tool Buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    title="Zoom In"
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    title="Zoom Out"
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    title="Rotate 90deg"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant={invert ? "default" : "outline"}
                    className="h-8 w-8 p-0"
                    title="Invert Grayscale"
                    onClick={() => setInvert((v) => !v)}
                  >
                    <Sun className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant={showGrid ? "default" : "outline"}
                    className="h-8 w-8 p-0"
                    title="Toggle Grid Overlay"
                    onClick={() => setShowGrid((g) => !g)}
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs px-2 text-muted-foreground"
                    onClick={handleResetViewer}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* PACS Screen Viewport */}
              <div className="bg-black relative min-h-[460px] flex items-center justify-center overflow-hidden select-none">
                {/* Image */}
                <div
                  className="transition-transform duration-200 ease-out flex items-center justify-center"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? "invert(1)" : ""}`,
                  }}
                >
                  <img
                    src={activeScan.url}
                    alt="DICOM Scan"
                    className="max-h-[420px] w-auto object-contain rounded"
                    style={{ pointerEvents: "none" }}
                  />
                </div>

                {/* Grid Overlay */}
                {showGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                )}

                {/* DICOM Telemetry HUD Overlay (Top-Left) */}
                <div className="absolute top-3 left-3 text-[11px] font-mono text-emerald-400 bg-black/75 p-2.5 rounded border border-emerald-500/20 pointer-events-none space-y-0.5">
                  <p className="font-bold text-xs">{activeScan.title}</p>
                  <p>MODALITY: {activeScan.modality}</p>
                  <p>STUDY: DIAGNOSTIC ACQUISITION</p>
                  <p>INSTITUTION: ICARE HOSPITAL</p>
                </div>

                {/* DICOM Acquisition Parameters (Top-Right) */}
                <div className="absolute top-3 right-3 text-[11px] font-mono text-emerald-400 bg-black/75 p-2.5 rounded border border-emerald-500/20 pointer-events-none space-y-0.5 text-right">
                  {Object.entries(activeScan.tags).map(([k, v]) => (
                    <p key={k}>
                      {k.toUpperCase()}: {v}
                    </p>
                  ))}
                </div>

                {/* Live Controls Indicators (Bottom-Right) */}
                <div className="absolute bottom-3 right-3 text-[11px] font-mono text-gray-400 bg-black/75 px-3 py-1.5 rounded pointer-events-none">
                  <span>ZOOM: {Math.round(zoomLevel * 100)}%</span> ·{" "}
                  <span>ROT: {rotation}°</span> ·{" "}
                  <span>BRT: {brightness}%</span> ·{" "}
                  <span>CON: {contrast}%</span>
                </div>
              </div>

              {/* Viewer Adjustments Drawer */}
              <div className="p-4 border-t border-border bg-card grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs">Brightness / Window Level</Label>
                    <span className="font-mono text-muted-foreground">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs">Contrast / Window Width</Label>
                    <span className="font-mono text-muted-foreground">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
