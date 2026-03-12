import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';

export default function AcceptQuotePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<'loading' | 'success' | 'already' | 'error'>('loading');
  const [quote, setQuote] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMsg('Invalid or missing link.');
      return;
    }

    const accept = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('accept-quote', {
          body: { token },
        });

        if (error) throw error;

        if (data.error) {
          setState('error');
          setErrorMsg(data.error);
          return;
        }

        setQuote(data.quote);
        setState(data.already ? 'already' : 'success');
      } catch (err: any) {
        setState('error');
        setErrorMsg(err.message || 'Something went wrong.');
      }
    };

    accept();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center">
            <FileText className="h-8 w-8 text-white" />
          </div>
        </div>

        {state === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-lg text-gray-600">Processing your response...</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Quote Accepted!</h1>
            <p className="text-gray-600">
              Thank you for accepting this quote. The job has been scheduled and your tradesperson will be in touch.
            </p>
            {quote && (
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                <p className="text-sm text-gray-500">Job details</p>
                <p className="font-semibold text-gray-900">{quote.description}</p>
                <p className="text-2xl font-bold text-gray-900">£{Number(quote.price).toFixed(2)}</p>
              </div>
            )}
          </>
        )}

        {state === 'already' && (
          <>
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Already Accepted</h1>
            <p className="text-gray-600">
              This quote has already been accepted. Your tradesperson is on it!
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-gray-600">{errorMsg}</p>
          </>
        )}

        <p className="text-xs text-gray-400 pt-4">Powered by TradeFlow</p>
      </div>
    </div>
  );
}
