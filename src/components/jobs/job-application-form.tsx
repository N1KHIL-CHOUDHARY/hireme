'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileIcon, Loader2, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { processFileForStorage } from '@/lib/file-utils';
import { IJob } from '@/models/job';

const formSchema = z.object({
  resumeUrl: z.string().optional(),
  resumeBase64: z.string().optional(),
  fileName: z.string().optional(),
  s3Key: z.string().optional(),
  s3Bucket: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface JobApplicationFormProps {
  jobId: string;
  job: IJob;
  inModal?: boolean;
  onSubmitSuccess?: (applicationId: string) => void;
  onClose?: () => void;
}

export function JobApplicationForm({
  job,
  inModal = false,
  onSubmitSuccess,
  onClose,
}: JobApplicationFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeUrl: '',
      resumeBase64: '',
      fileName: '',
      s3Key: '',
      s3Bucket: '',
    },
  });

  const [fileName, setFileName] = useState<string | null>(null);

  const handleResumeUpload = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setFileName(file.name);

      try {
        // Process file for storage (upload to S3 and convert to base64)
        const { url, base64, fileName, key, bucket } = await processFileForStorage(file);

        // Set form values
        form.setValue('resumeUrl', url);
        form.setValue('resumeBase64', base64);
        form.setValue('fileName', fileName);
        form.setValue('s3Key', key);
        form.setValue('s3Bucket', bucket);

        toast.success('Resume uploaded successfully', {
          description: 'Your resume has been attached to your application',
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Upload failed', {
          description: 'There was an error uploading your resume. Please try again.',
        });
        setFileName(null);
      } finally {
        setIsUploading(false);
      }
    },
    [form]
  );

  const removeFile = useCallback(() => {
    setFileName(null);
    form.setValue('resumeUrl', '');
    form.setValue('resumeBase64', '');
    form.setValue('fileName', '');
    form.setValue('s3Key', '');
    form.setValue('s3Bucket', '');
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleResumeUpload,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const { data: session } = useSession();

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    // Check if user is logged in
    if (!session || !session.user) {
      toast.error('Authentication required', {
        description: 'Please log in before applying for this job.',
      });
      setIsSubmitting(false);
      return;
    }

    // Ensure file was uploaded
    if (!values.resumeUrl || !values.resumeBase64) {
      toast.error('Missing resume', {
        description: 'Please upload your resume before submitting.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare application data - Always defaults to English
      const applicationData = {
        jobId: job._id || job.id,
        userId: session?.user?.id || '',
        resumeUrl: values.resumeUrl,
        resumeBase64: values.resumeBase64,
        fileName: values.fileName,
        s3Key: values.s3Key,
        s3Bucket: values.s3Bucket,
        preferredLanguage: 'en',
      };

      // Submit to API
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit application');
      }

      toast.success('Application submitted successfully!', {
        description: 'Your resume will now be analyzed.',
      });

      const applicationId = result.application._id;
      onSubmitSuccess?.(applicationId);
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Submission failed', {
        description: 'There was an error submitting your application. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="border border-border rounded-md p-4 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900 mb-1">{job.title}</h2>
            <p className="text-sm text-slate-500">{job.companyName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume" className="text-xs font-semibold text-slate-700">
              Resume / CV (PDF only)
            </Label>
            {!fileName ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-blue-50/50'
                    : 'border-slate-300 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-slate-600">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-800">
                      Drag & drop your resume PDF here, or click to browse
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF format (max 5MB)</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 border border-border rounded-md p-3 bg-white">
                <FileIcon className="h-6 w-6 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
                  <p className="text-xs text-slate-400">PDF Document</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-900"
                  onClick={removeFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (inModal) {
                onClose?.();
              } else {
                router.back();
              }
            }}
            disabled={isSubmitting}
          >
            {inModal ? 'Close' : 'Cancel'}
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
