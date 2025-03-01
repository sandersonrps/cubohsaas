import { toast as sonnerToast } from 'sonner'

const toast = {
  success: (message: string, description?: string) => 
    sonnerToast.success(message, { description }),
  error: (message: string, description?: string) => 
    sonnerToast.error(message, { description })
}

export default toast
