import { useEffect } from 'react'

const AuthCallback = () => {
    useEffect(() => {
        console.log('Auth callback handled')
    }, [])

    return (
        <div className="p-4 min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
                <p>Please wait while we complete your sign in.</p>
            </div>
        </div>
    )
}
export default AuthCallback