import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react'
import { CheckCircle } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export const SuccessModal = ({ isOpen, onClose, message }: SuccessModalProps) => {
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
        <ModalHeader className="flex gap-2 items-center text-success">
          <CheckCircle size={20} className="text-success" />
          <span>Success</span>
        </ModalHeader>
        <ModalBody>
          <p className="text-default-500">{message}</p>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="success" 
            variant="light" 
            onPress={onClose}
            autoFocus
          >
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 