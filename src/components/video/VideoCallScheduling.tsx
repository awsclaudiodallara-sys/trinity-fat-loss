/**
 * TRINITY FAT LOSS - Componente per Video Call Scheduling
 * Flusso A: Sistema di Proposta Semplice
 * 
 * UI per gestire proposte di videochiamata
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  AlertCircle,
  Loader,
  Plus,
  Trash2,
  Video
} from 'lucide-react';
import { useVideoCallProposal, useSchedulingUtils } from '../../lib/useVideoCallProposal';
import type { ProposalStatusView } from '../../lib/videoCallSchedulingService';

interface VideoCallSchedulingProps {
  trioId: string;
  currentUserId: string;
  onJoinCall?: (callId: string) => void;
}

export const VideoCallScheduling: React.FC<VideoCallSchedulingProps> = ({
  trioId,
  currentUserId,
  onJoinCall,
}) => {
  
  // Hook per gestire le proposte
  const {
    activePendingProposal,
    nextScheduledCall,
    isLoading,
    isCreatingProposal,
    isResponding,
    error,
    pendingResponsesCount,
    canJoinCall,
    timeUntilCall,
    createProposal,
    confirmProposal,
    rejectProposal,
    cancelProposal,
    clearError,
  } = useVideoCallProposal(trioId, currentUserId);

  // Hook per utility di formattazione
  const { formatDateTime } = useSchedulingUtils();

  // Stati locali per il form di proposta
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [proposalDate, setProposalDate] = useState('');
  const [proposalTime, setProposalTime] = useState('');
  const [proposalTitle, setProposalTitle] = useState('Weekly Trinity Call');
  const [proposalDescription, setProposalDescription] = useState('');

  /**
   * Gestisce la creazione di una nuova proposta
   */
  const handleCreateProposal = async () => {
    if (!proposalDate || !proposalTime) {
      return;
    }

    const datetime = new Date(`${proposalDate}T${proposalTime}`);
    
    const success = await createProposal(
      datetime,
      proposalTitle,
      proposalDescription || undefined
    );

    if (success) {
      // Reset form
      setShowCreateForm(false);
      setProposalDate('');
      setProposalTime('');
      setProposalTitle('Weekly Trinity Call');
      setProposalDescription('');
    }
  };

  /**
   * Componente per mostrare una proposta attiva
   */
  const ProposalCard: React.FC<{ proposal: ProposalStatusView }> = ({ proposal }) => {
    const isMyProposal = proposal.proposed_by === currentUserId;
    const hasResponded = proposal.confirmed_users.includes(currentUserId) || 
                        proposal.rejected_users.includes(currentUserId);

    return (
      <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">
              {proposal.title}
            </h3>
          </div>
          {isMyProposal && (
            <button
              onClick={() => cancelProposal(proposal.proposal_id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Cancella proposta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <Clock className="w-4 h-4" />
            <span className="font-medium">
              {formatDateTime(proposal.proposed_datetime)}
            </span>
          </div>
          
          {proposal.description && (
            <p className="text-gray-600 text-sm">{proposal.description}</p>
          )}
        </div>

        <div className="space-y-3">
          {/* Status delle conferme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {proposal.confirmed_count} di 2 conferme ricevute
              </span>
            </div>
            
            {pendingResponsesCount > 0 && (
              <div className="flex items-center space-x-1 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  {pendingResponsesCount} in attesa
                </span>
              </div>
            )}
          </div>

          {/* Lista delle risposte */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="space-y-1">
              <span className="font-medium text-green-700">Confermato:</span>
              {proposal.confirmed_count === 0 ? (
                <p className="text-gray-500">Nessuno</p>
              ) : (
                proposal.confirmed_users.map((userId: string, index: number) => (
                  <p key={userId} className="text-green-600">
                    {userId === currentUserId ? 'Tu' : `Membro ${index + 1}`}
                  </p>
                ))
              )}
            </div>
            
            <div className="space-y-1">
              <span className="font-medium text-red-700">Rifiutato:</span>
              {proposal.rejected_count === 0 ? (
                <p className="text-gray-500">Nessuno</p>
              ) : (
                proposal.rejected_users.map((userId: string, index: number) => (
                  <p key={userId} className="text-red-600">
                    {userId === currentUserId ? 'Tu' : `Membro ${index + 1}`}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* Pulsanti di azione */}
          {!isMyProposal && !hasResponded && (
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => confirmProposal(proposal.proposal_id)}
                disabled={isResponding}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isResponding ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Conferma</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => rejectProposal(proposal.proposal_id)}
                disabled={isResponding}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isResponding ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Rifiuta</span>
                  </>
                )}
              </button>
            </div>
          )}

          {hasResponded && (
            <div className="pt-2">
              <p className="text-sm text-gray-600">
                ✓ Hai già risposto a questa proposta
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Componente per mostrare la prossima chiamata programmata
   */
  const ScheduledCallCard = () => {
    if (!nextScheduledCall) return null;

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">
              Prossima Chiamata
            </h3>
          </div>
          
          {canJoinCall && onJoinCall && (
            <button
              onClick={() => onJoinCall(nextScheduledCall.id)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Video className="w-4 h-4" />
              <span>Entra</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-green-800">
            <Clock className="w-4 h-4" />
            <span className="font-medium">
              {formatDateTime(nextScheduledCall.scheduled_datetime)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">
              {nextScheduledCall.title}
            </span>
            
            {timeUntilCall && (
              <span className="text-sm text-green-600 font-medium">
                {canJoinCall ? '🟢 Puoi entrare ora!' : `⏰ ${timeUntilCall}`}
              </span>
            )}
          </div>

          {nextScheduledCall.description && (
            <p className="text-green-700 text-sm">
              {nextScheduledCall.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  /**
   * Form per creare una nuova proposta
   */
  const CreateProposalForm = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-blue-900">Proponi una Data</h3>
        <button
          onClick={() => setShowCreateForm(false)}
          className="text-blue-500 hover:text-blue-700"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">
            Data
          </label>
          <input
            type="date"
            value={proposalDate}
            onChange={(e) => setProposalDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">
            Ora
          </label>
          <input
            type="time"
            value={proposalTime}
            onChange={(e) => setProposalTime(e.target.value)}
            className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-800 mb-1">
          Titolo
        </label>
        <input
          type="text"
          value={proposalTitle}
          onChange={(e) => setProposalTitle(e.target.value)}
          className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-800 mb-1">
          Descrizione (opzionale)
        </label>
        <textarea
          value={proposalDescription}
          onChange={(e) => setProposalDescription(e.target.value)}
          rows={2}
          className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Argomenti da discutere..."
        />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleCreateProposal}
          disabled={isCreatingProposal || !proposalDate || !proposalTime}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isCreatingProposal ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              <span>Proponi</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Caricamento...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Errori */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Prossima chiamata programmata */}
      <ScheduledCallCard />

      {/* Proposta attiva */}
      {activePendingProposal && (
        <ProposalCard proposal={activePendingProposal} />
      )}

      {/* Pulsante per creare proposta */}
      {!activePendingProposal && !showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Proponi una Data per la Videochiamata</span>
        </button>
      )}

      {/* Form per creare proposta */}
      {showCreateForm && <CreateProposalForm />}
    </div>
  );
};
