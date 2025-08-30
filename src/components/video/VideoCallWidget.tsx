import React, { useState, useEffect } from "react";
import { Video, Calendar, Clock, Users, Phone } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { dashboardService } from "../../lib/supabase";

interface VideoCallStatus {
  isScheduled: boolean;
  scheduledTime?: string;
  participants: {
    id: string;
    name: string;
    confirmed: boolean;
    online: boolean;
  }[];
  callInProgress: boolean;
  nextCallSuggestion?: string;
}

interface VideoCallWidgetProps {
  currentUserId: string;
  onOpenVideo?: () => void;
}

export const VideoCallWidget: React.FC<VideoCallWidgetProps> = ({
  currentUserId,
  onOpenVideo,
}) => {
  const [callStatus, setCallStatus] = useState<VideoCallStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadTrioMembers = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching trio members using dashboardService...");
        const status = await dashboardService.getUserStatus(user.id);

        let participants;
        if (status?.trio?.members && status.trio.members.length > 0) {
          console.log(
            "Using REAL members from dashboardService:",
            status.trio.members
          );
          participants = status.trio.members.map((member: any) => ({
            id: member.id,
            name: member.name || `Member ${member.id.slice(-4)}`,
            confirmed: true,
            online: Math.random() > 0.3,
          }));
        } else {
          console.log("Using fallback members - no trio found");
          participants = [
            {
              id: "fallback1",
              name: "Claudio Dall'Ara",
              confirmed: true,
              online: true,
            },
            {
              id: "fallback2",
              name: "Membro 2",
              confirmed: true,
              online: false,
            },
            { id: currentUserId, name: "Tu", confirmed: true, online: true },
          ];
        }

        const mockStatus: VideoCallStatus = {
          isScheduled: true,
          scheduledTime: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          participants,
          callInProgress: false,
          nextCallSuggestion: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };

        setCallStatus(mockStatus);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading trio members:", error);
        const fallbackStatus: VideoCallStatus = {
          isScheduled: true,
          scheduledTime: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          participants: [
            {
              id: "fallback1",
              name: "Claudio Dall'Ara",
              confirmed: true,
              online: true,
            },
            {
              id: "fallback2",
              name: "Membro 2",
              confirmed: true,
              online: false,
            },
            { id: "you", name: "Tu", confirmed: true, online: true },
          ],
          callInProgress: false,
          nextCallSuggestion: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };
        setCallStatus(fallbackStatus);
        setIsLoading(false);
      }
    };

    loadTrioMembers();
  }, [user, currentUserId]);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeString = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${timeString}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeString}`;
    } else {
      return `${date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })} at ${timeString}`;
    }
  };

  const getTimeUntilCall = (isoString: string) => {
    const callTime = new Date(isoString).getTime();
    const now = new Date().getTime();
    const diffMs = callTime - now;

    if (diffMs <= 0) return "Starting now";

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `in ${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `in ${diffHours}h ${diffMins % 60}m`;
    return `in ${diffMins}m`;
  };

  const joinCall = () => {
    if (onOpenVideo) {
      onOpenVideo();
    } else {
      console.log("Joining video call...");
    }
  };

  const scheduleCall = () => {
    if (onOpenVideo) {
      onOpenVideo();
    } else {
      console.log("Opening call scheduling...");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!callStatus) return null;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Video className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Trinity Video Call
          </h3>
        </div>
        {callStatus.callInProgress && (
          <div className="flex items-center space-x-1 text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        )}
      </div>

      {callStatus.isScheduled && callStatus.scheduledTime ? (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Next Call Scheduled
            </span>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-medium">
                  {formatDateTime(callStatus.scheduledTime)}
                </p>
                <p className="text-blue-600 text-sm">
                  {getTimeUntilCall(callStatus.scheduledTime)}
                </p>
              </div>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800 text-sm font-medium">
                No call scheduled this week
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Trinity Members
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {callStatus.participants.map((participant) => (
            <div key={participant.id} className="text-center">
              <div className="relative inline-block mb-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    participant.confirmed
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {participant.name.charAt(0)}
                </div>
                {participant.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate">
                {participant.name}
              </p>
              {participant.confirmed && (
                <div className="text-xs text-green-600">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {callStatus.callInProgress ? (
          <button
            onClick={joinCall}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
          >
            <Phone className="h-4 w-4" />
            <span>Join Call</span>
          </button>
        ) : callStatus.isScheduled && callStatus.scheduledTime ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={joinCall}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Video className="h-4 w-4" />
              <span>Join</span>
            </button>
            <button
              onClick={scheduleCall}
              className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Calendar className="h-4 w-4" />
              <span>Reschedule</span>
            </button>
          </div>
        ) : (
          <button
            onClick={scheduleCall}
            className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
          >
            <Calendar className="h-4 w-4" />
            <span>Schedule Weekly Call</span>
          </button>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        {callStatus.isScheduled
          ? "Weekly Trinity support session"
          : "Weekly calls help maintain accountability"}
      </div>
    </div>
  );
};
