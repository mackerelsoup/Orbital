import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

type Props = {
    label: string;
    onPress?: () => void;
    children?: React.ReactElement
    style?: StyleProp<ViewStyle>
    labelStyle?: StyleProp<TextStyle>
};

export default function Button({ label, onPress, children, style, labelStyle }: Props) {

    return (
        <View style={[
            styles.buttonContainer,
            style
        ]}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    { opacity: pressed ? 0.5 : 1 },
                ]}
                onTouchEnd={onPress}
                >
                <View style = {{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={[styles.buttonLabel, labelStyle]}>{label}</Text>
                    {children}
                </View>

            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 8,

    },
    button: {
        width: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,

    },
    buttonLabel: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center'
    },
});
