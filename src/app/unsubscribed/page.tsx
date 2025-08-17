// src/app/unsubscribed/page.tsx
export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="h-12 w-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            You've been unsubscribed
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We're sorry to see you go! You won't receive any more newsletter emails from us.
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-4">
              If you change your mind, you can always subscribe again on our website.
            </p>
            <a 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}