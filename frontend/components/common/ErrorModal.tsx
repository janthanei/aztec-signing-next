import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react'
import { AlertTriangle } from 'lucide-react'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export const ErrorModal = ({ isOpen, onClose, message }: ErrorModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      classNames={{
        base: "bg-content1",
        header: "border-b border-divider",
        footer: "border-t border-divider"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center text-danger">
          <AlertTriangle size={20} className="text-danger" />
          <span>Error Occurred</span>
        </ModalHeader>
        <ModalBody>
          <p className="text-default-500">{message}</p>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
            autoFocus
          >
            Dismiss
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 