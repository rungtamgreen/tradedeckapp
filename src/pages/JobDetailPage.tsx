import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ArrowLeft, CheckCircle, Clock, Pencil, X, Save,
  Loader2, Camera, Trash2, FileText, Receipt,
} from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    description: '',
    price: '',
    notes: '',
    materials_notes: '',
    materials_cost: '',
    scheduled_date: '',
  });

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, customers(name, email)')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch photos from storage
  const photoFolder = user && id ? `${user.id}/${id}` : '';
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['job-photos', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('job-photos')
        .list(photoFolder, { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      return (data || []).map(file => ({
        name: file.name,
        url: supabase.storage.from('job-photos').getPublicUrl(`${photoFolder}/${file.name}`).data.publicUrl,
      }));
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', id!);
      if (error) throw error;

      // Send notification
      if ((job as any)?.customers?.email) {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'job-completed',
            recipientEmail: (job as any).customers.email,
            idempotencyKey: `job-completed-${id}`,
            templateData: {
              customerName: (job as any).customers.name,
              jobDescription: job?.description,
              jobPrice: `£${Number(job?.price).toFixed(2)}`,
              completedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            },
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Job marked complete — customer notified');
    },
    onError: () => toast.error('Failed to complete job'),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('jobs')
        .update({
          description: editForm.description,
          price: parseFloat(editForm.price),
          notes: editForm.notes || null,
          materials_notes: editForm.materials_notes || null,
          materials_cost: editForm.materials_cost ? parseFloat(editForm.materials_cost) : null,
          scheduled_date: editForm.scheduled_date || null,
        })
        .eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated');
    },
    onError: () => toast.error('Failed to update job'),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('job-photos')
        .upload(`${photoFolder}/${fileName}`, file);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-photos', id] });
      toast.success('Photo uploaded');
    },
    onError: () => toast.error('Failed to upload photo'),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.storage
        .from('job-photos')
        .remove([`${photoFolder}/${name}`]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-photos', id] });
      toast.success('Photo deleted');
    },
    onError: () => toast.error('Failed to delete photo'),
  });

  const startEditing = () => {
    if (!job) return;
    setEditForm({
      description: job.description,
      price: String(job.price),
      notes: (job as any).notes || '',
      materials_notes: job.materials_notes || '',
      materials_cost: job.materials_cost ? String(job.materials_cost) : '',
      scheduled_date: job.scheduled_date || '',
    });
    setEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <AppLayout title="Job" action={<Button variant="ghost" size="icon" onClick={() => navigate('/jobs')}><ArrowLeft className="h-5 w-5" /></Button>}>
        <div className="h-40 bg-muted rounded-lg animate-pulse" />
      </AppLayout>
    );
  }

  if (!job) {
    return (
      <AppLayout title="Job" action={<Button variant="ghost" size="icon" onClick={() => navigate('/jobs')}><ArrowLeft className="h-5 w-5" /></Button>}>
        <p className="text-center text-muted-foreground py-12">Job not found</p>
      </AppLayout>
    );
  }

  const isCompleted = job.status === 'completed';

  return (
    <AppLayout
      title="Job Details"
      action={<Button variant="ghost" size="icon" onClick={() => navigate('/jobs')}><ArrowLeft className="h-5 w-5" /></Button>}
    >
      {/* Main info card */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-foreground">{(job as any).customers?.name || 'Unknown'}</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
              isCompleted ? 'bg-green-500/10 text-green-600' : 'bg-accent/10 text-accent'
            }`}>
              {isCompleted ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {job.status}
            </span>
          </div>

          {editing ? (
            <div className="space-y-3">
              <Textarea
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                className="text-base min-h-[80px]"
                placeholder="Description"
              />
              <Input
                type="number" step="0.01" min="0"
                value={editForm.price}
                onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                className="h-12 text-base" placeholder="Price (£)"
              />
              <Input
                type="date"
                value={editForm.scheduled_date}
                onChange={e => setEditForm(f => ({ ...f, scheduled_date: e.target.value }))}
                className="h-12 text-base"
              />
              <Textarea
                value={editForm.notes}
                onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                className="text-base min-h-[60px]"
                placeholder="Job notes"
              />
              <Input
                value={editForm.materials_notes}
                onChange={e => setEditForm(f => ({ ...f, materials_notes: e.target.value }))}
                className="h-12 text-base" placeholder="Materials notes"
              />
              <Input
                type="number" step="0.01" min="0"
                value={editForm.materials_cost}
                onChange={e => setEditForm(f => ({ ...f, materials_cost: e.target.value }))}
                className="h-12 text-base" placeholder="Materials cost (£)"
              />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{job.description}</p>
              <p className="text-2xl font-bold text-foreground">£{Number(job.price).toFixed(2)}</p>
              {job.scheduled_date && (
                <p className="text-xs text-muted-foreground">
                  Scheduled: {new Date(job.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              {job.completed_at && (
                <p className="text-xs text-muted-foreground">
                  Completed: {new Date(job.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              {(job as any).notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{(job as any).notes}</p>
                </div>
              )}
              {(job.materials_notes || job.materials_cost) && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Materials</p>
                  {job.materials_notes && <p className="text-sm text-foreground">{job.materials_notes}</p>}
                  {job.materials_cost && <p className="text-sm font-medium text-foreground">Cost: £{Number(job.materials_cost).toFixed(2)}</p>}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Created {new Date(job.created_at).toLocaleDateString()}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      {!editing && (
        <div className="space-y-3 mb-4">
          {!isCompleted && (
            <Button
              size="lg"
              className="w-full h-14 text-base bg-success text-success-foreground hover:bg-success/90"
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? (
                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Completing...</>
              ) : (
                <><CheckCircle className="h-5 w-5 mr-2" /> Mark as Complete</>
              )}
            </Button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Button size="lg" variant="outline" className="h-14 text-base" onClick={startEditing}>
              <Pencil className="h-5 w-5 mr-2" /> Edit
            </Button>
            <Button
              size="lg" variant="outline" className="h-14 text-base"
              onClick={() => navigate(`/invoices/new?job_id=${id}`)}
            >
              <Receipt className="h-5 w-5 mr-2" /> Invoice
            </Button>
          </div>
        </div>
      )}

      {/* Photos section */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Photos</p>
            <Button
              size="sm" variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Camera className="h-4 w-4 mr-1" />
              )}
              Add Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {photosLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : photos.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No photos yet — tap Add Photo to attach images</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map(photo => (
                <div key={photo.name} className="relative group aspect-square">
                  <img
                    src={photo.url}
                    alt="Job photo"
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                  <button
                    onClick={() => deletePhotoMutation.mutate(photo.name)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
