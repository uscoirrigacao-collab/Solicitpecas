"use client";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PartRequest, RequestStatus, RequestItem } from "@/lib/types";

const partRequestsCollection = collection(db, "partRequests");

type PartRequestInput = Omit<PartRequest, "id" | "requestDate" | "status">;

export const addRequest = async (requestData: PartRequestInput) => {
  try {
    const docData = {
        ...requestData,
        requestDate: Timestamp.now(),
        status: 'pending' as RequestStatus,
        items: requestData.items.map(item => ({...item})) // Ensure items are plain objects
    };
    const docRef = await addDoc(partRequestsCollection, docData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to add request");
  }
};

export const updateRequest = async (id: string, requestData: Partial<PartRequest>) => {
    try {
        const docRef = doc(db, "partRequests", id);
        // Firebase does not allow undefined values
        const dataToUpdate = Object.fromEntries(
            Object.entries(requestData).filter(([_, v]) => v !== undefined)
        );
        await updateDoc(docRef, dataToUpdate);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Failed to update request");
    }
};


export const deleteRequest = async (id: string) => {
  try {
    await deleteDoc(doc(db, "partRequests", id));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw new Error("Failed to delete request");
  }
};

export const updateRequestStatus = async (id: string, status: RequestStatus) => {
    try {
        const docRef = doc(db, "partRequests", id);
        await updateDoc(docRef, { status });
    } catch (e) {
        console.error("Error updating status: ", e);
        throw new Error("Failed to update status");
    }
};

export const finalizeRequest = async (id: string) => {
    try {
        const docRef = doc(db, "partRequests", id);
        await updateDoc(docRef, { status: 'completed' });
    } catch (e) {
        console.error("Error finalizing request: ", e);
        throw new Error("Failed to finalize request");
    }
};


export const listenToRequests = (
  isAdmin: boolean,
  userRegistration: string | null,
  callback: (requests: PartRequest[]) => void
) => {
    let q;
    if (isAdmin) {
        // Admin gets all non-completed requests, ordered by date
        q = query(partRequestsCollection, orderBy("requestDate", "desc"));
    } else if (userRegistration) {
        // User gets their non-completed requests, ordered by date
        q = query(
            partRequestsCollection,
            where("registrationNumber", "==", userRegistration),
            where("status", "!=", "completed"),
            orderBy("status"),
            orderBy("requestDate", "desc")
        );
    } else {
        // No registration, no data for non-admin
        callback([]);
        return () => {}; // Return an empty unsubscribe function
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const requests = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to ISO string for consistency
                requestDate: (data.requestDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as PartRequest;
        });
        callback(requests);
    }, (error) => {
        console.error("Error listening to requests:", error);
        callback([]); // Send empty array on error
    });

    return unsubscribe; // Return the unsubscribe function
};
