import { useNavigation } from '@react-navigation/native';

const useNavigationCustom = () => {
    const navigation = useNavigation();

    const goBack = () => {
        navigation.goBack();
    };

    const navigateTo = (screenName, params) => {
        navigation.navigate(screenName, params);
    };

    return { goBack, navigateTo };
};

export default useNavigationCustom;