import { useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { admittedPatients } from "./ipd";
import { AlertTriangle, ClipboardList, CalendarCheck, CheckCircle2, Plus, Save, Trash2, Edit, Search, FileText, Eye, Upload } from "lucide-react";

const submoduleMeta: Record<string, { title: string; description: string }> = {
  notes: {
    title: "Notes",
    description: "View the patient's clinical and nursing notes recorded during this admission.",
  },
  "note-create": {
    title: "Create Note",
    description: "Write a new progress note for the patient and attach it to the current admission record.",
  },
  "note-finder": {
    title: "Note Finder",
    description: "Search through patient notes by keyword, author, or date.",
  },
  "consumable-requisition": {
    title: "Consumable Requisition",
    description: "Request ward consumables and chart items needed for bedside care.",
  },
  "vital-sign-graph": {
    title: "Vital Sign Graph",
    description: "Visualize trends in temperature, pulse, blood pressure, and oxygen saturation.",
  },
  "prescribed-medicine": {
    title: "Prescribed Medicine",
    description: "Review and update the patient's active medication orders.",
  },
  mar: {
    title: "MAR",
    description: "Medication administration history and nurse checks for the inpatient stay.",
  },
  "ipd-services": {
    title: "IPD Services",
    description: "Track clinical services ordered for the patient during admission.",
  },
  procedures: {
    title: "Procedures",
    description: "View scheduled or completed procedures and their clinical status.",
  },
  "final-diagnosis": {
    title: "Final Diagnosis",
    description: "Capture the admission discharge diagnosis and clinical summary for the patient.",
  },
  "doctor-visit": {
    title: "Doctor Visit",
    description: "Review the doctor's ward visit notes and planned follow-up actions.",
  },
  "vital-sign-chart": {
    title: "Vital Sign Chart",
    description: "See the vital sign values recorded over time in a structured chart view.",
  },
  "blood-transfusion": {
    title: "Blood Transfusion",
    description: "Create a blood transfusion request and collect pre-transfusion checks.",
  },
  "blood-transfusion-record": {
    title: "Blood Transfusion Record",
    description: "Review the history of blood transfusions delivered during this admission.",
  },
  billing: {
    title: "Billing",
    description: "Check the patient's current charges, insurance coverage, and payment status.",
  },
  allergy: {
    title: "Patient Allergy",
    description: "Document and review allergies, reactions, and medication sensitivities.",
  },
  "med-return": {
    title: "Medication Return Requisition",
    description: "Register medicines being returned from the ward or patient bedside.",
  },
  "view-requisition": {
    title: "View Requisition",
    description: "Browse open requisitions for consumables, medicines and investigations.",
  },
  "sample-collection": {
    title: "Sample Collection",
    description: "Manage lab sample labels, collection status and pickup schedules.",
  },
  investigation: {
    title: "Investigation View",
    description: "Track ordered investigations, report status and review pending tests.",
  },
  "blood-request": {
    title: "Blood Request",
    description: "Request blood products and specify the required components for transfusion.",
  },
  "pre-op-checklist": {
    title: "Pre-Op Checklist",
    description: "Confirm all pre-operative safety checks before planned surgery.",
  },
  "room-shift": {
    title: "Room Shift",
    description: "Move the patient to a new ward, room or bed as clinical needs change.",
  },
  discharge: {
    title: "Discharge",
    description: "Complete the discharge summary and prepare the patient for transfer home.",
  },
  documents: {
    title: "View / Uploaded Document",
    description: "Reference admission documents, attachments and scanned reports.",
  },
  "intake-output": {
    title: "Intake Output Chart",
    description: "Monitor fluid balance with intake and output totals for the patient.",
  },
  "transfer-mortuary": {
    title: "Transfer To Mortuary",
    description: "Create a transfer order for the patient in the event of a deceased admission.",
  },
  "ot-trainer": {
    title: "OT Trainer",
    description: "Record occupational therapy sessions and planned rehab activities.",
  },
  "bill-print": {
    title: "Bill Print",
    description: "Print the patient's current invoice and summary billing statement.",
  },
  "neurological-exam": {
    title: "Neurological Exam",
    description: "Document bedside neurological findings and cognitive assessment.",
  },
};

// Individual submodule components
function NoteCreateComponent() {
  const noteTypes = ["Ward Round Note", "Nursing Note", "Discharge Note", "Consult Note"];
  const templates = ["History Template", "Assessment Template", "Plan Template"];
  const sources = ["Active Medicine", "Patient Demographic", "Last Vital", "Investigation", "NICU", "PACS Images"];
  
  // State for note creation
  const [selectedNoteType, setSelectedNoteType] = useState(noteTypes[0]);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [noteContent, setNoteContent] = useState("Enter the patient's progress note, clinical update and care plan here...");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveDraft = async () => {
    if (!noteContent.trim() || noteContent.trim() === "Enter the patient's progress note, clinical update and care plan here...") {
      toast({
        title: "No content",
        description: "Please enter some note content before saving.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Draft saved",
        description: "Note draft has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNote = async () => {
    if (!noteContent.trim() || noteContent.trim() === "Enter the patient's progress note, clinical update and care plan here...") {
      toast({
        title: "No content",
        description: "Please enter some note content before creating the note.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Note created",
        description: `${selectedNoteType} has been created and saved to patient record.`,
      });
      setNoteContent("Enter the patient's progress note, clinical update and care plan here...");
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "Failed to create note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Note Writer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Note Type *</Label>
            <Select value={selectedNoteType} onValueChange={setSelectedNoteType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {noteTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template} value={template}>
                    {template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Available Data Sources</Label>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <Badge 
                key={source} 
                variant="secondary" 
                className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  // Insert source data into note
                  const placeholder = `[${source}] `;
                  setNoteContent(prev => prev + placeholder);
                }}
              >
                {source}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Click on a source to insert placeholder data into your note.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
            {[
              { label: "B", action: "bold" },
              { label: "I", action: "italic" },
              { label: "U", action: "underline" },
              { label: "•", action: "bullet" },
              { label: "1.", action: "number" },
              { label: "Quote", action: "quote" },
              { label: "Table", action: "table" },
              { label: "Img", action: "image" },
            ].map((toolbarItem) => (
              <Button 
                key={toolbarItem.label} 
                variant="outline" 
                size="sm" 
                className="min-w-[40px] px-2 hover:bg-accent"
                onClick={() => {
                  // Handle formatting actions
                  toast({
                    title: "Formatting",
                    description: `${toolbarItem.label} formatting applied.`,
                  });
                }}
              >
                {toolbarItem.label}
              </Button>
            ))}
          </div>
          <div className="p-4">
            <Textarea
              rows={12}
              className="min-h-[320px] bg-white text-slate-900 border-none resize-none focus-visible:ring-0"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter the patient's progress note, clinical update and care plan here..."
            />
          </div>
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground">
              {noteContent.length} characters
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-foreground border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button 
            onClick={handleCreateNote}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Create Note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NoteFinderComponent() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      toast({
        title: "No search term",
        description: "Please enter a keyword to search for notes.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Simulate search results
      const mockResults = [
        {
          id: 1,
          content: `Patient shows improvement in ${searchKeyword} parameters...`,
          author: "Dr. Ochieng",
          type: "Ward Round Note",
          date: "2026-03-14 09:20",
          excerpt: `...patient demonstrates positive response to treatment with ${searchKeyword} showing marked improvement...`
        },
        {
          id: 2,
          content: `Monitoring ${searchKeyword} levels throughout the shift...`,
          author: "Nurse Akinyi",
          type: "Nursing Note", 
          date: "2026-03-13 17:35",
          excerpt: `...regular monitoring of ${searchKeyword} with stable readings documented...`
        }
      ];
      
      setSearchResults(mockResults);
      toast({
        title: "Search completed",
        description: `Found ${mockResults.length} note(s) containing "${searchKeyword}".`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search notes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-5 w-5" />
          Find Note
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="search-keyword">Search keyword *</Label>
            <Input 
              id="search-keyword"
              placeholder="Enter note text, author or date" 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-type">Filter by type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All note types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All note types</SelectItem>
                <SelectItem value="doctor">Doctor note</SelectItem>
                <SelectItem value="nursing">Nursing note</SelectItem>
                <SelectItem value="discharge">Discharge note</SelectItem>
                <SelectItem value="consult">Consult note</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="gap-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search Notes
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchKeyword("");
              setFilterType("");
              setSearchResults([]);
            }}
          >
            Clear
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold">Search Results ({searchResults.length})</h3>
            <div className="space-y-3">
              {searchResults.map((result) => (
                <Card key={result.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{result.type}</Badge>
                        <span className="text-sm text-muted-foreground">by {result.author}</span>
                        <span className="text-xs text-muted-foreground">{result.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.excerpt}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && searchKeyword && !isSearching && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notes found matching your search criteria.</p>
            <p className="text-sm">Try different keywords or adjust the filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConsumableRequisitionForm({ patient }: { patient: any }) {
  const consumableOptions = [
    "Normal saline 500ml",
    "Gauze swabs",
    "Syringes 10ml",
    "IV cannula 18G",
    "Urine bag",
    "Oxygen mask",
    "Gloves (Medium)",
    "Gauze roll 10cm",
    "Alcohol swabs",
    "Bandages 5cm",
    "Thermometer covers",
    "Face masks",
  ];
  const priorities = ["Normal", "Urgent", "Stat"];
  const issuingDepartments = ["Pharmacy", "Stores", "Laboratory", "CSSD", "Radiology"];
  const { toast } = useToast();
  
  // Form state
  const [wardLocation, setWardLocation] = useState(patient.ward || "");
  const [requestedBy, setRequestedBy] = useState(patient.billingDoctor || "");
  const [requestTo, setRequestTo] = useState(issuingDepartments[0]);
  const [neededBy, setNeededBy] = useState(new Date().toISOString().slice(0, 10));
  const [selectedItem, setSelectedItem] = useState(consumableOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState(priorities[0]);
  const [notes, setNotes] = useState("");
  
  // Items state
  const [items, setItems] = useState<Array<{ item: string; qty: number; priority: string }>>([]);
  
  // Requisitions state
  const [requisitions, setRequisitions] = useState<Array<{
    id: string;
    createdAt: string;
    wardLocation: string;
    requestedBy: string;
    requestTo: string;
    neededBy: string;
    notes: string;
    items: Array<{ item: string; qty: number; priority: string }>;
    itemCount: number;
    status: "Pending" | "Issued" | "Partially Issued" | "Rejected";
  }>>([]);
  
  // UI state
  const [showRequisitionList, setShowRequisitionList] = useState(false);
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!wardLocation.trim()) {
      newErrors.wardLocation = "Ward location is required";
    }
    if (!requestedBy.trim()) {
      newErrors.requestedBy = "Requester name is required";
    }
    if (!requestTo.trim()) {
      newErrors.requestTo = "Issuing department is required";
    }
    if (!neededBy) {
      newErrors.neededBy = "Required by date is required";
    } else {
      const selectedDate = new Date(neededBy);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.neededBy = "Required by date cannot be in the past";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [wardLocation, requestedBy, requestTo, neededBy]);

  // Add line item with validation
  const addLineItem = useCallback(() => {
    if (!selectedItem) {
      toast({ 
        title: "No item selected", 
        description: "Please select an item before adding.", 
        variant: "destructive" 
      });
      return;
    }
    
    if (quantity < 1) {
      toast({ 
        title: "Invalid quantity", 
        description: "Quantity must be at least 1.", 
        variant: "destructive" 
      });
      return;
    }
    
    // Check if item already exists
    const existingItemIndex = items.findIndex(item => item.item === selectedItem);
    if (existingItemIndex !== -1) {
      // Update existing item
      setItems((prev) => 
        prev.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, qty: item.qty + quantity, priority }
            : item
        )
      );
      toast({ 
        title: "Item updated", 
        description: `Added ${quantity} more ${selectedItem} to existing request.`
      });
    } else {
      // Add new item
      setItems((prev) => [...prev, { item: selectedItem, qty: quantity, priority }]);
      toast({ 
        title: "Item added", 
        description: `Added ${quantity} ${selectedItem} to requisition.`
      });
    }
    
    // Reset form fields
    setQuantity(1);
    setPriority(priorities[0]);
  }, [selectedItem, quantity, priority, items, toast, priorities]);

  // Remove line item
  const removeLineItem = useCallback((index: number) => {
    const removedItem = items[index];
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast({ 
      title: "Item removed", 
      description: `Removed ${removedItem.item} from requisition.`
    });
  }, [items, toast]);

  // Reset form
  const resetForm = useCallback(() => {
    setItems([]);
    setNotes("");
    setQuantity(1);
    setPriority(priorities[0]);
    setSelectedItem(consumableOptions[0]);
    setErrors({});
  }, [priorities, consumableOptions]);

  // Submit requisition with proper validation
  const submitRequisition = useCallback(async () => {
    if (!validateForm()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fix the highlighted errors before submitting.", 
        variant: "destructive" 
      });
      return;
    }

    if (items.length === 0) {
      toast({ 
        title: "No items", 
        description: "Add at least one consumable item to the requisition.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random failure for testing
          if (Math.random() > 0.9) {
            reject(new Error("Network error"));
          } else {
            resolve(true);
          }
        }, 1500);
      });

      const newRequisition = {
        id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        createdAt: new Date().toLocaleString(),
        wardLocation: wardLocation.trim(),
        requestedBy: requestedBy.trim(),
        requestTo: requestTo.trim(),
        neededBy,
        notes: notes.trim(),
        items: [...items],
        itemCount: items.length,
        status: "Pending" as const,
      };

      setRequisitions((prev) => [newRequisition, ...prev]);
      
      toast({
        title: "Requisition submitted successfully",
        description: `Requisition ${newRequisition.id} created with ${items.length} item(s) for ${patient.name}.`,
      });
      
      resetForm();
      setShowRequisitionList(true);
      
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An error occurred while submitting the requisition.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, items, wardLocation, requestedBy, requestTo, neededBy, notes, patient.name, toast, resetForm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Consumable Requisition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Input value={`${patient.name} (${patient.pid})`} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ward-location">Ward / Location *</Label>
            <Input 
              id="ward-location"
              value={wardLocation} 
              onChange={(e) => {
                setWardLocation(e.target.value);
                if (errors.wardLocation) {
                  setErrors(prev => ({ ...prev, wardLocation: '' }));
                }
              }}
              className={errors.wardLocation ? "border-destructive" : ""} 
              placeholder="Enter ward or location"
            />
            {errors.wardLocation && (
              <p className="text-sm text-destructive">{errors.wardLocation}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="requested-by">Requested By *</Label>
            <Input 
              id="requested-by"
              value={requestedBy} 
              onChange={(e) => {
                setRequestedBy(e.target.value);
                if (errors.requestedBy) {
                  setErrors(prev => ({ ...prev, requestedBy: '' }));
                }
              }}
              className={errors.requestedBy ? "border-destructive" : ""} 
              placeholder="Enter requester name"
            />
            {errors.requestedBy && (
              <p className="text-sm text-destructive">{errors.requestedBy}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Request To *</Label>
            <Select 
              value={requestTo} 
              onValueChange={(value) => {
                setRequestTo(value);
                if (errors.requestTo) {
                  setErrors(prev => ({ ...prev, requestTo: '' }));
                }
              }}
            >
              <SelectTrigger className={errors.requestTo ? "border-destructive" : ""}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {issuingDepartments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.requestTo && (
              <p className="text-sm text-destructive">{errors.requestTo}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="needed-by">Required By *</Label>
            <Input 
              id="needed-by"
              type="date" 
              value={neededBy} 
              onChange={(e) => {
                setNeededBy(e.target.value);
                if (errors.neededBy) {
                  setErrors(prev => ({ ...prev, neededBy: '' }));
                }
              }}
              className={errors.neededBy ? "border-destructive" : ""} 
              min={new Date().toISOString().slice(0, 10)}
            />
            {errors.neededBy && (
              <p className="text-sm text-destructive">{errors.neededBy}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Consumable Item</Label>
            <Select value={selectedItem} onValueChange={(value) => setSelectedItem(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {consumableOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input 
              id="quantity"
              type="number" 
              min={1} 
              max={999}
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} 
              placeholder="Enter quantity"
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((level) => (
                  <SelectItem key={level} value={level}>
                    <span className={`font-medium ${
                      level === 'Stat' ? 'text-red-600' : 
                      level === 'Urgent' ? 'text-orange-600' : 
                      'text-blue-600'
                    }`}>
                      {level}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes / Instructions</Label>
          <Textarea 
            id="notes"
            rows={3} 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Enter delivery notes, preferred packaging, or clinical justification..."
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            {notes.length}/500 characters
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            type="button" 
            onClick={addLineItem}
            disabled={!selectedItem || quantity < 1}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
          <span className="text-sm text-muted-foreground">
            Add each consumable item to build your requisition.
          </span>
          {items.length > 0 && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={`${item.item}-${index}`}>
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.qty}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${
                      item.priority === 'Stat' ? 'bg-red-100 text-red-800' : 
                      item.priority === 'Urgent' ? 'bg-orange-100 text-orange-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeLineItem(index)}
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
                      <p>No requisition items added yet.</p>
                      <p className="text-sm">Add items using the form above.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Total items: <span className="font-semibold">{items.length}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {requisitions.length > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowRequisitionList((prev) => !prev)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {showRequisitionList ? "Hide Requisitions" : `View Requisitions (${requisitions.length})`}
              </Button>
            )}
            <Button 
              type="button" 
              onClick={submitRequisition} 
              disabled={isSubmitting || items.length === 0}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Raise Requisition
                </>
              )}
            </Button>
          </div>
        </div>

        {requisitions.length > 0 && showRequisitionList && (
          <div className="space-y-4 pt-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Raised Requisitions</p>
                  <p className="text-xs text-slate-500">Showing all requests and their current status.</p>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requisitions.map((req) => (
                    <>
                      <TableRow key={req.id}>
                        <TableCell>{req.createdAt}</TableCell>
                        <TableCell>{req.requestTo}</TableCell>
                        <TableCell>{req.wardLocation}</TableCell>
                        <TableCell>{req.requestedBy}</TableCell>
                        <TableCell>{req.itemCount}</TableCell>
                        <TableCell>
                          <Badge className="capitalize">{req.status.toLowerCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedRequisitionId((prev) => (prev === req.id ? null : req.id))}>
                            {selectedRequisitionId === req.id ? "Hide Details" : "View"}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {selectedRequisitionId === req.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-slate-50 p-4">
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
                              <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Needed By</p>
                                  <p className="text-sm font-medium">{req.neededBy}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Request Notes</p>
                                  <p className="text-sm text-slate-600">{req.notes || "No additional notes."}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Status</p>
                                  <Badge className="capitalize">{req.status.toLowerCase()}</Badge>
                                </div>
                              </div>
                              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead>Qty</TableHead>
                                      <TableHead>Priority</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {req.items.map((item, index) => (
                                      <TableRow key={`${req.id}-item-${index}`}>
                                        <TableCell>{item.item}</TableCell>
                                        <TableCell>{item.qty}</TableCell>
                                        <TableCell>{item.priority}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FinalDiagnosisComponent({ patient }: { patient: any }) {
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState(patient.diagnosis || "");
  const [clinicalSummary, setClinicalSummary] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!primaryDiagnosis.trim()) {
      toast({
        title: "Primary diagnosis required",
        description: "Please enter a primary diagnosis.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Final diagnosis saved", 
        description: "Patient's final diagnosis and clinical summary have been updated.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Unable to save diagnosis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Final Diagnosis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="primary-diagnosis">Primary Diagnosis *</Label>
          <Textarea
            id="primary-diagnosis"
            rows={3}
            value={primaryDiagnosis}
            onChange={(e) => setPrimaryDiagnosis(e.target.value)}
            placeholder="Enter the primary diagnosis for this admission..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinical-summary">Clinical Summary</Label>
          <Textarea
            id="clinical-summary"
            rows={6}
            value={clinicalSummary}
            onChange={(e) => setClinicalSummary(e.target.value)}
            placeholder="Summarize the clinical course, investigations, treatments..."
            maxLength={2000}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            onClick={handleSave}
            disabled={isSaving || !primaryDiagnosis.trim()}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Diagnosis
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MedicationReturnComponent({ patient }: { patient: any }) {
  const [medicineName, setMedicineName] = useState("");
  const [availableMedicines] = useState([
    "Captopril 25mg",
    "Metformin 500mg", 
    "Paracetamol 500mg",
    "Amoxicillin 250mg",
    "Ibuprofen 200mg"
  ]);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [returnType, setReturnType] = useState("Excess");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const returnTypes = ["Excess", "Expired", "Damaged", "Patient Discharged", "Changed Prescription"];

  const handleSubmit = async () => {
    if (!medicineName.trim()) {
      toast({
        title: "Medicine not selected",
        description: "Please select a medicine to return.",
        variant: "destructive"
      });
      return;
    }

    if (quantity < 1) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity to return.",
        variant: "destructive"
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for returning the medicine.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const returnId = `MR-${Date.now()}`;
      toast({
        title: "Medication return submitted",
        description: `Return request ${returnId} for ${quantity} ${medicineName} has been sent to pharmacy.`,
      });
      setMedicineName("");
      setQuantity(1);
      setReason("");
      setReturnType("Excess");
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Unable to submit return request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Medication Return Requisition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Input value={`${patient.name} (${patient.pid})`} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Ward</Label>
            <Input value={patient.ward} readOnly className="bg-muted" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Medicine Name *</Label>
            <Select value={medicineName} onValueChange={setMedicineName}>
              <SelectTrigger>
                <SelectValue placeholder="Select medicine to return" />
              </SelectTrigger>
              <SelectContent>
                {availableMedicines.map(medicine => (
                  <SelectItem key={medicine} value={medicine}>{medicine}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input 
              id="quantity"
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Return Reason / Type *</Label>
          <Select value={returnType} onValueChange={setReturnType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {returnTypes.map(type => (
                <SelectItem key={type} value={type}>
                  <span className={`${
                    type === 'Expired' || type === 'Damaged' ? 'text-red-600' :
                    type === 'Patient Discharged' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {type}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="return-reason">Reason for Return *</Label>
          <Textarea 
            id="return-reason"
            rows={4} 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide detailed reason for returning the medicine (e.g., Patient no longer requires medication, dosage changed, etc.)"
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground">
            {reason.length}/300 characters
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Return Guidelines</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Ensure medicines are in original packaging when possible</li>
                <li>• Expired medicines should be segregated and labeled</li>
                <li>• Document exact quantities being returned</li>
                <li>• Include batch numbers for controlled substances</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setMedicineName("");
              setQuantity(1);
              setReason("");
              setReturnType("Excess");
            }}
          >
            Clear Form
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !medicineName || !reason.trim()}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Submit Return
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DischargeSummaryComponent({ patient }: { patient: any }) {
  const [dischargeType, setDischargeType] = useState("Home");
  const [dischargeSummary, setDischargeSummary] = useState("");
  const [followUpInstructions, setFollowUpInstructions] = useState("");
  const [medicationsOnDischarge, setMedicationsOnDischarge] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const dischargeTypes = ["Home", "Transfer to Another Facility", "Against Medical Advice", "Referral", "Death"];

  const addMedication = () => {
    if (newMedication.trim() && !medicationsOnDischarge.includes(newMedication.trim())) {
      setMedicationsOnDischarge(prev => [...prev, newMedication.trim()]);
      setNewMedication("");
      toast({
        title: "Medication added",
        description: "Discharge medication has been added to the list.",
      });
    }
  };

  const removeMedication = (index: number) => {
    setMedicationsOnDischarge(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalize = async () => {
    if (!dischargeSummary.trim()) {
      toast({
        title: "Discharge summary required",
        description: "Please provide a discharge summary.",
        variant: "destructive"
      });
      return;
    }

    if (dischargeType === "Home" && !followUpInstructions.trim()) {
      toast({
        title: "Follow-up instructions required",
        description: "Please provide follow-up instructions for home discharge.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast({
        title: "Discharge processed successfully",
        description: `Patient ${patient.name} has been discharged ${dischargeType.toLowerCase()}. Discharge summary completed.`,
      });
    } catch (error) {
      toast({
        title: "Discharge processing failed",
        description: "Unable to process discharge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarCheck className="h-5 w-5" />
          Discharge Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Input value={patient.name} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Discharge Type *</Label>
            <Select value={dischargeType} onValueChange={setDischargeType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dischargeTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    <span className={`${
                      type === 'Death' ? 'text-red-600' :
                      type === 'Against Medical Advice' ? 'text-orange-600' :
                      'text-gray-700'
                    }`}>
                      {type}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discharge-summary">Discharge Summary *</Label>
          <Textarea
            id="discharge-summary"
            rows={8}
            value={dischargeSummary}
            onChange={(e) => setDischargeSummary(e.target.value)}
            placeholder="Provide comprehensive discharge summary including admission reason, treatment provided, patient response, and current condition..."
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">
            {dischargeSummary.length}/2000 characters
          </p>
        </div>

        {dischargeType !== "Death" && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Medications on Discharge</Label>
                <div className="flex gap-2">
                  <Input
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Enter medication with dosage..."
                    onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addMedication}
                    disabled={!newMedication.trim()}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              {medicationsOnDischarge.length > 0 && (
                <div className="space-y-2">
                  {medicationsOnDischarge.map((medication, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">{medication}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup-instructions">Follow-up Instructions {dischargeType === "Home" ? "*" : ""}</Label>
              <Textarea
                id="followup-instructions"
                rows={5}
                value={followUpInstructions}
                onChange={(e) => setFollowUpInstructions(e.target.value)}
                placeholder="Provide detailed follow-up instructions, activity restrictions, when to seek medical attention, etc..."
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {followUpInstructions.length}/1000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup-date">Follow-up Appointment Date</Label>
              <Input
                id="followup-date"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </>
        )}

        {dischargeType === "Death" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Death Discharge Requirements</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Ensure death certificate is completed</li>
                  <li>• Notify next of kin if not already done</li>
                  <li>• Complete mortuary transfer documentation</li>
                  <li>• Update hospital death registry</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setDischargeSummary("");
              setFollowUpInstructions("");
              setMedicationsOnDischarge([]);
              setFollowUpDate("");
              setDischargeType("Home");
            }}
          >
            Reset Form
          </Button>
          <Button 
            onClick={handleFinalize}
            disabled={isProcessing || !dischargeSummary.trim() || (dischargeType === "Home" && !followUpInstructions.trim())}
            className="gap-2"
            variant={dischargeType === "Death" ? "destructive" : "default"}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Finalize Discharge
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function renderSubmoduleBody(key: string, patient: any) {
  switch (key) {
    case "notes": {
      const notes = [
        { author: "Dr. Ochieng", type: "Ward Round Note", note: "Patient remains stable with controlled blood pressure.", time: "2026-03-14 09:20" },
        { author: "Nurse Akinyi", type: "Nursing Note", note: "IV site clean, legs elevated, pain managed with paracetamol.", time: "2026-03-13 17:35" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clinical Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.author}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.note}</TableCell>
                    <TableCell>{item.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "note-create":
      return <NoteCreateComponent />;
    case "note-finder":
      return <NoteFinderComponent />;
    case "consumable-requisition":
      return <ConsumableRequisitionForm patient={patient} />;
    case "vital-sign-graph":
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vital Signs Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 rounded-3xl bg-slate-950 p-6 text-slate-400">
                <p className="text-sm">Graph preview placeholder showing temperature, pulse, blood pressure, and SPO2 trends over time.</p>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Latest Temperature", value: "36.8°C" },
              { label: "Latest Pulse", value: "78 bpm" },
              { label: "Latest BP", value: "132/84 mmHg" },
              { label: "Latest SPO2", value: "98%" },
            ].map((card) => (
              <Card key={card.label}>
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                  <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    case "prescribed-medicine": {
      const meds = [
        { drug: "Captopril 25mg", dose: "1 tab BD", route: "PO", status: "Active" },
        { drug: "Metformin 500mg", dose: "1 tab BD", route: "PO", status: "Active" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prescribed Medicines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meds.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.drug}</TableCell>
                    <TableCell>{item.dose}</TableCell>
                    <TableCell>{item.route}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button>Update Prescription</Button>
          </CardContent>
        </Card>
      );
    }
    case "mar": {
      const administrations = [
        { time: "08:00", medication: "Captopril", nurse: "Nurse Akinyi", status: "Given" },
        { time: "14:00", medication: "Metformin", nurse: "Nurse Wanjiru", status: "Scheduled" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medication Administration Record</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Nurse</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {administrations.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.medication}</TableCell>
                    <TableCell>{item.nurse}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "ipd-services": {
      const services = [
        { name: "Physiotherapy", status: "Pending" },
        { name: "Dietitian Consultation", status: "Scheduled" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">IPD Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button>Order New Service</Button>
          </CardContent>
        </Card>
      );
    }
    case "procedures": {
      const procedures = [
        { procedure: "Chest X-ray", date: "2026-03-15", status: "Planned" },
        { procedure: "IV Cannulation", date: "2026-03-13", status: "Completed" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Procedures</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedures.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.procedure}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "final-diagnosis":
      return <FinalDiagnosisComponent patient={patient} />;
    case "doctor-visit": {
      const visits = [
        { doctor: "Dr. Ochieng", time: "09:00", notes: "Continue antihypertensives, observe input/output." },
        { doctor: "Dr. Njeri", time: "15:00", notes: "Review post-op wound, order repeat labs." },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Doctor Visit Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.doctor}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "vital-sign-chart": {
      const values = [
        { date: "2026-03-13", temp: "37.1°C", pulse: "80 bpm", bp: "120/78" },
        { date: "2026-03-14", temp: "36.9°C", pulse: "78 bpm", bp: "118/76" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vital Sign Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Pulse</TableHead>
                  <TableHead>BP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {values.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.temp}</TableCell>
                    <TableCell>{item.pulse}</TableCell>
                    <TableCell>{item.bp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }

    case "blood-transfusion-record": {
      const records = [
        { date: "2026-03-12", component: "Packed Cells", units: 2, status: "Completed" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transfusion Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.component}</TableCell>
                    <TableCell>{item.units}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "billing": {
      const charges = [
        { item: "Bed charges", amount: 4200 },
        { item: "Medication", amount: 1800 },
        { item: "Lab tests", amount: 2100 },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount (KES)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell>{item.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell>{charges.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Button>Review Invoice</Button>
          </CardContent>
        </Card>
      );
    }
    case "allergy": {
      const allergies = [
        { agent: "Penicillin", reaction: "Rash", severity: "Moderate" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Allergy Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Allergen</TableHead>
                  <TableHead>Reaction</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allergies.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.agent}</TableCell>
                    <TableCell>{item.reaction}</TableCell>
                    <TableCell>{item.severity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button>Add Allergy</Button>
          </CardContent>
        </Card>
      );
    }
    case "med-return":
      return <MedicationReturnComponent patient={patient} />;
    case "view-requisition": {
      const requisitions = [
        { id: "REQ-1001", type: "Medication", status: "Approved" },
        { id: "REQ-1002", type: "Consumable", status: "Pending" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requisition Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisitions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "sample-collection": {
      const samples = [
        { sample: "CBC", status: "Collected" },
        { sample: "Culture", status: "Pending" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sample Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sample</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.sample}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button>Request Collection</Button>
          </CardContent>
        </Card>
      );
    }
    case "investigation": {
      const investigations = [
        { name: "Chest X-ray", status: "Approved" },
        { name: "Blood culture", status: "Pending" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Investigations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investigation</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investigations.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "blood-request":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Blood Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Component required" defaultValue="Packed Cells" />
            <Input placeholder="Units" defaultValue="2" type="number" />
            <Textarea rows={4} placeholder="Clinical justification" defaultValue="Post-operative anemia with Hb 7.8 g/dL." />
            <Button>Submit Blood Request</Button>
          </CardContent>
        </Card>
      );
    case "pre-op-checklist": {
      const checklist = [
        "Consent form signed",
        "Fasting confirmed",
        "Blood group checked",
        "Allergies verified",
        "IV access secured",
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pre-Op Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }
    case "room-shift":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Room Shift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Current Ward</Label><Input defaultValue={patient.ward} readOnly /></div>
              <div className="space-y-2"><Label>New Ward / Bed</Label><Input placeholder="Enter new ward / bed" /></div>
            </div>
            <Button>Submit Transfer</Button>
          </CardContent>
        </Card>
      );
    case "discharge":
      return <DischargeSummaryComponent patient={patient} />;
    case "documents": {
      const docs = [
        { name: "Admission Form.pdf", uploaded: "2026-03-10" },
        { name: "Lab Result.pdf", uploaded: "2026-03-13" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((doc, index) => (
                  <TableRow key={index}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{doc.uploaded}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button>Upload Document</Button>
          </CardContent>
        </Card>
      );
    }
    case "intake-output":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Intake / Output Chart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-950 p-4">
                <p className="text-xs uppercase text-slate-500">Total Intake</p>
                <p className="mt-2 text-2xl font-semibold">2300 ml</p>
              </div>
              <div className="rounded-3xl bg-slate-950 p-4">
                <p className="text-xs uppercase text-slate-500">Total Output</p>
                <p className="mt-2 text-2xl font-semibold">1900 ml</p>
              </div>
            </div>
            <div className="h-48 rounded-3xl bg-slate-900 p-4 text-slate-400">Chart preview placeholder for fluid balance.</div>
          </CardContent>
        </Card>
      );
    case "transfer-mortuary":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transfer to Mortuary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <Textarea rows={4} defaultValue="Confirm deceased patient transfer to mortuary with transfer notes." />
            <Button variant="destructive">Submit Transfer</Button>
          </CardContent>
        </Card>
      );
    case "ot-trainer":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">OT Trainer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">Plan and track occupational therapy exercises and training sessions.</p>
            <Textarea rows={5} defaultValue="Document rehabilitation goals and daily therapy progress." />
            <Button>Save OT Plan</Button>
          </CardContent>
        </Card>
      );
    case "bill-print":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bill Print</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">Preview the current patient bill and print it for the ward cashier.</p>
            <Button>Print Bill</Button>
          </CardContent>
        </Card>
      );
    case "neurological-exam":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neurological Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Level of consciousness</Label><Input defaultValue="Alert" readOnly /></div>
              <div className="space-y-2"><Label>Pupils</Label><Input defaultValue="Equal reactive" readOnly /></div>
            </div>
            <Textarea rows={5} defaultValue="Motor exam, reflexes, coordination and sensory findings." />
          </CardContent>
        </Card>
      );
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patient Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">Select a submodule from the sidebar to manage the patient's IPD workflow.</p>
          </CardContent>
        </Card>
      );
  }
}

export default function IPDSubmodulePage() {
  const { id, submodule } = useParams();
  const patient = useMemo(
    () => admittedPatients.find((item) => item.id === id) ?? admittedPatients[0],
    [id]
  );

  const slugToKey: Record<string, string> = {
    "create-note": "note-create",
    "find-note": "note-finder",
    "consumables": "consumable-requisition",
    "vital-graph": "vital-sign-graph",
    "vital-chart": "vital-sign-chart",
    "services": "ipd-services",
    "documents": "documents",
    "intake-output": "intake-output",
    "transfer-mortuary": "transfer-mortuary",
    "bill-print": "bill-print",
    "allergy": "allergy",
    "med-return": "med-return",
    "view-requisition": "view-requisition",
    "sample-collection": "sample-collection",
    "investigation": "investigation",
    "blood-request": "blood-request",
    "pre-op-checklist": "pre-op-checklist",
    "room-shift": "room-shift",
    "discharge": "discharge",
    "prescribed-medicine": "prescribed-medicine",
    "mar": "mar",
    "procedures": "procedures",
    "final-diagnosis": "final-diagnosis",
    "doctor-visit": "doctor-visit",
    "blood-transfusion": "blood-transfusion",
    "blood-transfusion-record": "blood-transfusion-record",
    "billing": "billing",
    "neurological-exam": "neurological-exam",
  };

  const key = (submodule && (slugToKey[submodule] ?? submodule)) ?? "notes";
  const meta = submoduleMeta[key] ?? {
    title: key.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    description: "Use this screen to manage the selected IPD task for the patient.",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">{meta.title}</h2>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
      </div>
      {renderSubmoduleBody(key, patient)}
    </div>
  );
}
