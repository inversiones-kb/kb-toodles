import { NewProviderFields, Provider } from "@/types/providersTypes";
import { db } from "@/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { CustomApiResponse } from "@/types/coreTypes";
import { API_MESSAGES } from "@/utils/apiUtils";

export const handleNewProvider = async (
  data: NewProviderFields
): Promise<CustomApiResponse> => {
  console.log(data);

  const providersCollection = collection(db, "providers");
  try {
    const newProvider = await addDoc(providersCollection, {
      ...data,
      created_at: new Date(),
    });
    return {
      success: true,
      message: API_MESSAGES.provider.created,
    };
  } catch (error) {
    return {
      success: false,
      message: API_MESSAGES.provider.error,
    };
  }
};
