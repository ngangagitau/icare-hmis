import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Users, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useAppointments, useUpdateAppointment } from "@/hooks/useAppointments";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const Appointments = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: appointmentsData, isLoading, error } = useAppointments(currentPage, 10);
  const updateAppointmentMutation = useUpdateAppointment();
  const { toast } = useToast();

  const appointments = appointmentsData?.data || [];
  const pagination = appointmentsData?.pagination;

  const statusColor: Record<string, string> = {
    "Checked In": "bg-blue-100 text-blue-800",
    "Waiting": "bg-yellow-100 text-yellow-800",
    "Scheduled": "bg-gray-100 text-gray-800",
    "In Progress": "bg-green-100 text-green-800",
    "Completed": "bg-emerald-100 text-emerald-800",
    "No Show": "bg-red-100 text-red-800",
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointmentMutation.mutateAsync({
        id: appointmentId,
        data: { status: newStatus as any },
      });
      toast({ title: "Success", description: "Appointment status updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update appointment", variant: "destructive" });
    }
  };

  const checkedInCount = appointments.filter(a => a.status === "Checked In").length;
  const waitingCount = appointments.filter(a => a.status === "Waiting").length;
  const completedCount = appointments.filter(a => a.status === "Completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Today's Schedule</h1>
        <p className="text-muted-foreground text-sm">Appointments & OPD Management</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Today", value: String(appointments.length), icon: CalendarDays, color: "text-blue-600" },
          { label: "Checked In", value: String(checkedInCount), icon: CheckCircle, color: "text-green-600" },
          { label: "Waiting", value: String(waitingCount), icon: Clock, color: "text-yellow-600" },
          { label: "Completed", value: String(completedCount), icon: Users, color: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Appointment List</CardTitle></CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <p>Loading appointments...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle className="mr-2 h-6 w-6" />
              <p>Failed to load appointments</p>
            </div>
          )}

          {!isLoading && !error && appointments.length === 0 && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p>No appointments found</p>
            </div>
          )}

          {!isLoading && appointments.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Time</th><th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Doctor</th>
                    <th className="pb-2 pr-4">Department</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Action</th>
                  </tr></thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a._id || a.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono">{a.appointmentTime}</td>
                        <td className="py-3 pr-4 font-medium">{a.patient}</td>
                        <td className="py-3 pr-4">{a.doctor}</td>
                        <td className="py-3 pr-4">{a.department || "N/A"}</td>
                        <td className="py-3">
                          <Badge className={statusColor[a.status] || "bg-gray-100 text-gray-800"}>{a.status}</Badge>
                        </td>
                        <td className="py-3">
                          <select 
                            className="text-xs border rounded px-2 py-1"
                            value={a.status}
                            onChange={(e) => handleStatusUpdate(a._id || a.id || "", e.target.value)}
                            disabled={updateAppointmentMutation.isPending}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Checked In">Checked In</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No Show">No Show</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Appointments;
