import type { IFriendRequest } from "../../types/friends.types";
import FriendRequestCard from "./FriendRequestCard";
import { FriendsEmptyState, FriendsLoadMoreButton } from "../shared/FriendsStates";

interface IFriendRequestsViewProps {
  received: IFriendRequest[];
  sent: IFriendRequest[];
  receivedTotal: number;
  sentTotal: number;
  receivedHasMore: boolean;
  sentHasMore: boolean;
  loadingMoreReceived: boolean;
  loadingMoreSent: boolean;
  acceptingRequestId?: string;
  decliningRequestId?: string;
  cancellingRequestId?: string;
  onAccept: (request: IFriendRequest) => void;
  onDecline: (request: IFriendRequest) => void;
  onCancel: (request: IFriendRequest) => void;
  onLoadMoreReceived: () => void;
  onLoadMoreSent: () => void;
}

export default function FriendRequestsView({
  received,
  sent,
  receivedTotal,
  sentTotal,
  receivedHasMore,
  sentHasMore,
  loadingMoreReceived,
  loadingMoreSent,
  acceptingRequestId,
  decliningRequestId,
  cancellingRequestId,
  onAccept,
  onDecline,
  onCancel,
  onLoadMoreReceived,
  onLoadMoreSent,
}: IFriendRequestsViewProps) {
  return (
    <div className="flex flex-col gap-7">
      <section>
        <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-[#9b9a92]">
          Received · {receivedTotal}
        </p>
        {received.length > 0 ? (
          <div className="space-y-2.5">
            {received.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                accepting={acceptingRequestId === request.id}
                declining={decliningRequestId === request.id}
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))}
            {receivedHasMore && (
              <div className="flex justify-center pt-2">
                <FriendsLoadMoreButton
                  loading={loadingMoreReceived}
                  onClick={onLoadMoreReceived}
                  label="Load more received invites"
                />
              </div>
            )}
          </div>
        ) : (
          <FriendsEmptyState
            title="No pending invites"
            message="Friend invites sent to you will show up here."
          />
        )}
      </section>

      <section>
        <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-[#9b9a92]">
          Sent · {sentTotal}
        </p>
        {sent.length > 0 ? (
          <div className="space-y-2.5">
            {sent.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                cancelling={cancellingRequestId === request.id}
                onCancel={onCancel}
              />
            ))}
            {sentHasMore && (
              <div className="flex justify-center pt-2">
                <FriendsLoadMoreButton
                  loading={loadingMoreSent}
                  onClick={onLoadMoreSent}
                  label="Load more sent invites"
                />
              </div>
            )}
          </div>
        ) : (
          <FriendsEmptyState
            title="No invites sent"
            message="Invites you send to other learners will show up here."
          />
        )}
      </section>
    </div>
  );
}
